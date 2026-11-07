/*
Copyright © 2026 Dawid Foltyński github@dfoltynski
*/
package cmd

import (
	"context"
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "run",
	Short: "Run and manage containers",
	Long:  `Run and manage new container created in specified environment`,
	Run: func(cmd *cobra.Command, args []string) {
		branch, branchErr := cmd.Flags().GetString("branch")
		HandleCliError(branchErr)
		repo, repoErr := cmd.Flags().GetString("repo")
		HandleCliError(repoErr)
		env, envErr := cmd.Flags().GetString("env")
		HandleCliError(envErr)
		if len(branch) <= 0 {
			HandleCliError(fmt.Errorf("branch flag is required"))
		}
		ctx := context.Background()

		_, err := Deploy(ctx, repo, branch, env)
		HandleCliError(err)
	},
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.Flags().StringP("branch", "b", "", "Enter branch url")
	rootCmd.Flags().StringP("repo", "r", "", "Enter repo/owner")
	rootCmd.Flags().StringP("env", "e", "", "Enter environment")
}
