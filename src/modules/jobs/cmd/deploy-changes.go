package cmd

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"net/netip"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/docker/docker/pkg/stdcopy"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

type Result struct {
	Env                  string
	Network              string
	Repo                 string
	Branch               string
	SHA                  string
	ImageTag             string
	ContainerName        string
	ContainerID          string
	ExposedContainerPort string
	HostPort             int
}

const (
	LockDir            = "/tmp/jobs-locks"
	waitRunningTimeout = 12 * time.Second
	waitTCPTimeout     = 18 * time.Second
	logTailLines       = "200"
)

func Deploy(ctx context.Context, repo, branch, env string) (*Result, error) {

	fmt.Println("--------------------------------------------------")
	fmt.Println("[deploy] starting deploy")
	fmt.Println("[deploy] repo:", repo)
	fmt.Println("[deploy] branch:", branch)
	fmt.Println("[deploy] env:", env)

	if ctx == nil {
		return nil, errors.New("nil context")
	}

	networkName := env

	lockKey := makeContainerName(env, repo, branch)

	fmt.Println("[deploy] acquiring lock:", lockKey)

	unlock, err := acquireLock(lockKey)
	if err != nil {
		return nil, err
	}
	defer unlock()

	fmt.Println("[deploy] connecting docker client")

	apiClient, err := client.New(client.FromEnv)
	if err != nil {
		return nil, err
	}
	defer apiClient.Close()

	fmt.Println("[deploy] ensuring docker network:", networkName)

	if err := ensureNetwork(ctx, apiClient, networkName); err != nil {
		return nil, err
	}

	fmt.Println("[deploy] resolving branch SHA")

	sha, err := resolveHeadSHA(repo, branch)
	if err != nil {
		return nil, err
	}

	fmt.Println("[deploy] SHA:", sha)

	shortSHA := sha
	if len(shortSHA) > 12 {
		shortSHA = sha[:12]
	}

	repoURL := "https://github.com/" + repo + ".git"

	fmt.Println("[deploy] cloning repository")

	tmpDir, err := os.MkdirTemp("", "jobs-deploy-*")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(tmpDir)

	if err := gitCloneAndCheckout(tmpDir, repoURL, sha); err != nil {
		return nil, err
	}

	fmt.Println("[deploy] clone complete")

	imageTag := fmt.Sprintf("%s-%s:%s", env, sanitize(repo), shortSHA)

	fmt.Println("[deploy] building docker image:", imageTag)

	buildCtx, err := tarGzDir(tmpDir)
	if err != nil {
		return nil, err
	}
	defer buildCtx.Close()

	buildResp, err := apiClient.ImageBuild(ctx, buildCtx, client.ImageBuildOptions{
		Tags:       []string{imageTag},
		Dockerfile: "Dockerfile",
		Remove:     true,
	})

	if err != nil {
		return nil, err
	}

	defer buildResp.Body.Close()

	if err := printDockerStream(buildResp.Body); err != nil {
		return nil, err
	}

	fmt.Println("[deploy] docker build finished")

	fmt.Println("[deploy] inspecting exposed ports")

	exposedPortStr, err := determineSingleExposedTCPPort(ctx, apiClient, imageTag)
	if err != nil {
		return nil, err
	}

	fmt.Println("[deploy] container exposes:", exposedPortStr)

	hostPort, err := getFreePort()
	if err != nil {
		return nil, err
	}

	fmt.Println("[deploy] selected host port:", hostPort)

	containerName := makeContainerName(env, repo, branch)

	fmt.Println("[deploy] removing existing container if exists:", containerName)

	if err := removeIfExists(ctx, apiClient, containerName); err != nil {
		return nil, err
	}

	p, err := network.ParsePort(exposedPortStr)
	if err != nil {
		return nil, err
	}

	exposed := network.PortSet{
		p: struct{}{},
	}

	bindings := network.PortMap{
		p: []network.PortBinding{
			{
				HostIP:   netip.MustParseAddr("0.0.0.0"),
				HostPort: fmt.Sprintf("%d", hostPort),
			},
		},
	}

	labels := map[string]string{
		"jobs.env":    env,
		"jobs.repo":   repo,
		"jobs.branch": branch,
		"jobs.sha":    sha,
	}

	fmt.Println("[deploy] creating container")

	createResp, err := apiClient.ContainerCreate(ctx, client.ContainerCreateOptions{
		Name: containerName,
		Config: &container.Config{
			Image:        imageTag,
			Labels:       labels,
			ExposedPorts: exposed,
		},
		HostConfig: &container.HostConfig{
			RestartPolicy: container.RestartPolicy{Name: "unless-stopped"},
			PortBindings:  bindings,
		},
		NetworkingConfig: &network.NetworkingConfig{
			EndpointsConfig: map[string]*network.EndpointSettings{
				networkName: {},
			},
		},
	})

	if err != nil {
		return nil, err
	}

	fmt.Println("[deploy] container created:", createResp.ID)

	fmt.Println("[deploy] starting container")

	if _, err := apiClient.ContainerStart(ctx, createResp.ID, client.ContainerStartOptions{}); err != nil {
		return nil, err
	}

	fmt.Println("[deploy] waiting for container running")

	if err := waitContainerRunning(ctx, apiClient, createResp.ID, waitRunningTimeout); err != nil {

		logs := tailContainerLogs(ctx, apiClient, createResp.ID)

		return nil, fmt.Errorf(
			"container failed\n\nlogs:\n%s",
			logs,
		)
	}

	fmt.Println("[deploy] probing TCP")

	if err := waitTCP("127.0.0.1", hostPort, waitTCPTimeout); err != nil {

		logs := tailContainerLogs(ctx, apiClient, createResp.ID)

		return nil, fmt.Errorf(
			"tcp failed\n\nlogs:\n%s",
			logs,
		)
	}

	fmt.Println("[deploy] SUCCESS running at localhost:", hostPort)

	fmt.Println("--------------------------------------------------")

	return &Result{
		Env:                  env,
		Network:              networkName,
		Repo:                 repo,
		Branch:               branch,
		SHA:                  sha,
		ImageTag:             imageTag,
		ContainerName:        containerName,
		ContainerID:          createResp.ID,
		ExposedContainerPort: exposedPortStr,
		HostPort:             hostPort,
	}, nil
}

type dockerStream struct {
	Stream string `json:"stream"`
	Error  string `json:"error"`
}

func printDockerStream(r io.Reader) error {

	decoder := json.NewDecoder(r)

	for {

		var msg dockerStream

		if err := decoder.Decode(&msg); err != nil {

			if err == io.EOF {
				return nil
			}

			return err
		}

		if msg.Error != "" {
			return errors.New(msg.Error)
		}

		if msg.Stream != "" {
			fmt.Print(msg.Stream)
		}
	}
}

func determineSingleExposedTCPPort(
	ctx context.Context,
	apiClient *client.Client,
	imageTag string,
) (string, error) {

	img, err := apiClient.ImageInspect(ctx, imageTag)

	if err != nil {
		return "", err
	}

	if img.Config == nil {
		return "", errors.New("no image config")
	}

	var ports []string

	for k := range img.Config.ExposedPorts {

		s := fmt.Sprint(k)

		if strings.HasSuffix(s, "/tcp") {
			ports = append(ports, s)
		}
	}

	if len(ports) == 0 {
		return "", errors.New("no EXPOSE found")
	}

	if len(ports) > 1 {
		return "", errors.New("multiple EXPOSE ports")
	}

	return ports[0], nil
}

func waitContainerRunning(
	ctx context.Context,
	apiClient *client.Client,
	id string,
	timeout time.Duration,
) error {

	deadline := time.Now().Add(timeout)

	for time.Now().Before(deadline) {

		ins, err := apiClient.ContainerInspect(
			ctx,
			id,
			client.ContainerInspectOptions{},
		)

		if err != nil {
			return err
		}

		if ins.Container.State != nil {

			if ins.Container.State.Running {
				return nil
			}

			if ins.Container.State.Status == "exited" {

				return fmt.Errorf(
					"container exited code=%d",
					ins.Container.State.ExitCode,
				)
			}
		}

		time.Sleep(300 * time.Millisecond)
	}

	return errors.New("timeout waiting container")
}

func waitTCP(host string, port int, timeout time.Duration) error {

	deadline := time.Now().Add(timeout)

	addr := fmt.Sprintf("%s:%d", host, port)

	for time.Now().Before(deadline) {

		conn, err := net.DialTimeout(
			"tcp",
			addr,
			time.Second,
		)

		if err == nil {

			conn.Close()

			return nil
		}

		time.Sleep(300 * time.Millisecond)
	}

	return errors.New("tcp timeout")
}

func tailContainerLogs(
	ctx context.Context,
	apiClient *client.Client,
	id string,
) string {

	res, err := apiClient.ContainerLogs(
		ctx,
		id,
		client.ContainerLogsOptions{
			ShowStdout: true,
			ShowStderr: true,
			Tail:       logTailLines,
		},
	)

	if err != nil {
		return err.Error()
	}

	defer res.Close()

	var b strings.Builder

	stdcopy.StdCopy(&b, &b, res)

	return b.String()
}

func resolveHeadSHA(repo, branch string) (string, error) {

	url := "https://github.com/" + repo + ".git"

	cmd := exec.Command(
		"git",
		"ls-remote",
		url,
		"refs/heads/"+branch,
	)

	out, err := cmd.CombinedOutput()

	if err != nil {
		return "", errors.New(string(out))
	}

	fields := strings.Fields(string(out))

	if len(fields) == 0 {
		return "", errors.New("branch not found")
	}

	return fields[0], nil
}

func gitCloneAndCheckout(
	dir,
	url,
	sha string,
) error {

	cmd := exec.Command(
		"git",
		"clone",
		url,
		dir,
	)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command(
		"git",
		"-C",
		dir,
		"checkout",
		sha,
	)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func ensureNetwork(
	ctx context.Context,
	apiClient *client.Client,
	name string,
) error {

	nets, err := apiClient.NetworkList(
		ctx,
		client.NetworkListOptions{},
	)

	if err != nil {
		return err
	}

	for _, n := range nets.Items {

		if n.Name == name {
			return nil
		}
	}

	_, err = apiClient.NetworkCreate(
		ctx,
		name,
		client.NetworkCreateOptions{
			Driver: "bridge",
		},
	)

	return err
}

func removeIfExists(
	ctx context.Context,
	apiClient *client.Client,
	name string,
) error {

	list, err := apiClient.ContainerList(
		ctx,
		client.ContainerListOptions{
			All: true,
		},
	)

	if err != nil {
		return err
	}

	for _, c := range list.Items {

		for _, n := range c.Names {

			if strings.TrimPrefix(n, "/") == name {

				_, err := apiClient.ContainerRemove(
					ctx,
					c.ID,
					client.ContainerRemoveOptions{
						Force: true,
					},
				)

				return err
			}
		}
	}

	return nil
}

func getFreePort() (int, error) {

	l, err := net.Listen(
		"tcp",
		"127.0.0.1:0",
	)

	if err != nil {
		return 0, err
	}

	defer l.Close()

	_, port, _ := net.SplitHostPort(
		l.Addr().String(),
	)

	var p int

	fmt.Sscanf(port, "%d", &p)

	time.Sleep(
		time.Duration(rand.Intn(80)) * time.Millisecond,
	)

	return p, nil
}

func tarGzDir(dir string) (io.ReadCloser, error) {

	pr, pw := io.Pipe()

	go func() {

		defer pw.Close()

		gz := gzip.NewWriter(pw)
		defer gz.Close()

		tw := tar.NewWriter(gz)
		defer tw.Close()

		filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {

			if err != nil {
				return err
			}

			rel, _ := filepath.Rel(dir, path)

			if rel == "." {
				return nil
			}

			if strings.HasPrefix(rel, ".git") {
				return nil
			}

			h, _ := tar.FileInfoHeader(info, "")

			h.Name = rel

			tw.WriteHeader(h)

			if info.Mode().IsRegular() {

				f, _ := os.Open(path)

				io.Copy(tw, f)

				f.Close()
			}

			return nil
		})
	}()

	return pr, nil
}

func HandleCliError(err error) {

	if err == nil {
		return
	}

	fmt.Println("[deploy ERROR]")
	fmt.Println(err)

	os.Exit(1)
}
func makeContainerName(env, repo, branch string) string {
	// preview: many branch deployments
	// staging: one per repo (latest wins)
	if env == "preview" {
		return fmt.Sprintf("%s-%s-%s", env, sanitize(repo), sanitize(branch))
	}
	return fmt.Sprintf("%s-%s", env, sanitize(repo))
}

func sanitize(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = strings.ReplaceAll(s, "/", "-")
	s = strings.ReplaceAll(s, "_", "-")
	s = strings.ReplaceAll(s, " ", "-")
	return s
}

func acquireLock(key string) (func(), error) {
	if err := os.MkdirAll(LockDir, 0o755); err != nil {
		return nil, err
	}
	lockPath := filepath.Join(LockDir, key+".lock")

	f, err := os.OpenFile(lockPath, os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return nil, err
	}

	if err := syscall.Flock(int(f.Fd()), syscall.LOCK_EX); err != nil {
		_ = f.Close()
		return nil, err
	}

	return func() {
		_ = syscall.Flock(int(f.Fd()), syscall.LOCK_UN)
		_ = f.Close()
	}, nil
}
