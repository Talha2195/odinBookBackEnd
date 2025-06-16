import passport from "passport"
import { Strategy as GitHubStrategy } from "passport-github2"
import * as db from "../db/prismaClient.js"

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://odinbookbackend.onrender.com/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db.findUser(profile.username)

        if (!user) {
          user = await db.addUserToDataBase(
            profile.username,
            "",
            profile.username,
            null,
            profile.photos?.[0]?.value
          )
        }
        user.role = "regular"

        return done(null, user)
      } catch (error) {
        console.error("Error in GitHub Strategy:", error)
        return done(error, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.findUserById(id)
    done(null, user)
  } catch (error) {
    console.error("Error in deserializeUser:", error)
    done(error, null)
  }
})

export const githubAuth = passport.authenticate("github")

export const githubCallback = (req, res, next) => {
  passport.authenticate("github", (err, user) => {
    if (err || !user) {
      return res.redirect("https://odin-book-front-end-ikcw.vercel.app")
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.redirect("https://odin-book-front-end-ikcw.vercel.app")
      }
      req.session.user = user
      res.redirect("https://odin-book-front-end-ikcw.vercel.app/profile")
    })
  })(req, res, next)
}
