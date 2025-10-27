import auth from "@flycatch/auth-core";
import envConfig from "./env.config";
import {
  getUserByMail,
  verifyPassword,
  createUser,
} from "../services/auth.service";
import { getNonExpiredOtp, StoreOtp } from "../services/otp.service";
import { sendOTP } from "../services/mail.service";
import {
  tokenBlacklistStorageService,
  handleLogoutAll,
} from "../services/token.service";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as GitHubStrategy } from "passport-github2";

export const authConfig = auth.config({
  twoFA: {
    enabled: true,
    otpExpiresIn: "2m",
    otpLength: 7,
    otpType: "alphanumeric",
    storeOtp: StoreOtp,
    transport: sendOTP,
    getStoredOtp: getNonExpiredOtp,
  },

  oauth2: {
    enabled: true,
    baseURL: envConfig.BASE_URL,
    prefix: "/auth",
    successRedirect: `${envConfig.BASE_URL}/oauth-success`,
    failureRedirect: `${envConfig.BASE_URL}/oauth-failure`,
    defaultRole: "ROLE_USER",
    setRefreshCookie: true,
    appendTokensInRedirect: false,
    onSuccess(info) {
      const { profile, existingUser, provider } = info;

      // Case 1: User already exists
      if (existingUser) {
        console.log(`Existing user logged in: ${existingUser.email}`);
        return existingUser;
      }

      return createUser(profile);
    },

    providers: {
      google: {
        clientID: envConfig.GOOGLE_CLIENT_ID,
        clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"],
        strategy: GoogleStrategy,
        profileMapping: {
          email: "emails[0].value",
          id: "id",
          name: "displayName",
        },
      },
      facebook: {
        clientID: envConfig.FACEBOOK_CLIENT_ID,
        clientSecret: envConfig.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/auth/facebook/callback",
        strategy: FacebookStrategy,
        scope: ["email", "public_profile"],
        customConfig: {
          profileFields: ["id", "displayName", "emails", "photos"],
        },
        profileMapping: {
          id: "id",
          email: "emails[0].value",
          name: "displayName",
        },
      },
      github: {
        clientID: envConfig.GITHUB_CLIENT_ID,
        clientSecret: envConfig.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
        scope: ["user:email"],
        strategy: GitHubStrategy,
        profileMapping: {
          email: "emails[0].value",
          id: "id",
          name: "displayName",
        },
      },
      twitter: {
        clientID: envConfig.TWITTER_CONSUMER_KEY,
        clientSecret: envConfig.TWITTER_CONSUMER_SECRET,
        callbackURL: "/auth/twitter/callback",
        strategy: TwitterStrategy,
        customConfig: {
          consumerKey: envConfig.TWITTER_CONSUMER_KEY,
          consumerSecret: envConfig.TWITTER_CONSUMER_SECRET,
          includeEmail: true,
        },
        profileMapping: {
          email: "emails[0].value",
          id: "id",
          name: "displayName",
        },
      },
      linkedIn: {
        clientID: envConfig.LINKEDIN_CLIENT_ID,
        clientSecret: envConfig.LINKEDIN_CLIENT_SECRET,
        callbackURL: "/auth/linkedin/callback",
        strategy: LinkedInStrategy,
        scope: ["r_liteprofile", "r_emailaddress"],
        customConfig: { state: true },
        profileMapping: {
          email: "emails[0].value",
          id: "id",
          name: "displayName",
        },
      },
      spotify: {
        clientID: envConfig.SPOTIFY_CLIENT_ID,
        clientSecret: envConfig.SPOTIFY_CLIENT_SECRET,
        callbackURL: "/auth/spotify/callback",
        strategy: SpotifyStrategy,
        scope: ["user-read-email", "user-read-private"],
        customConfig: { showDialog: true },
        profileMapping: {
          email: "emails[0].value",
          id: "id",
          name: "display_name",
        },
      },
      discord: {
        clientID: envConfig.DISCORD_CLIENT_ID,
        clientSecret: envConfig.DISCORD_CLIENT_SECRET,
        callbackURL: "/auth/discord/callback",
        strategy: DiscordStrategy,
        scope: ["identify", "email"],
        profileMapping: { email: "email", id: "id", name: "username" },
      },
    },
  },

  session: {
    enabled: false,
    prefix: "/auth/session",
    secret: envConfig.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  },

  jwt: {
    enabled: true,
    secret: envConfig.JWT_SECRET,
    expiresIn: "8h",
    refresh: false,
    refreshExpiresIn: "7d",
    prefix: "/auth/jwt",
    revokeOnRefresh: true,
    tokenBlacklist: {
      enabled: true,
      storageService: tokenBlacklistStorageService,
      onLogoutAll: handleLogoutAll,
    },
  },

  userService: {
    loadUser: getUserByMail,
  },
  passwordChecker: verifyPassword,
  logs: true,
});
