import passport from "passport";
import PassportGithub from "passport-github2";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "../environment-variables";

const GitHubStrategy = PassportGithub.Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    },
    function (
      accessToken: string,
      refreshToken: string,
      profile: unknown,
      done: () => void,
    ) {},
  ),
);
