const express = require("express")
const {
  githubAuth,
  githubCallback,
} = require("../../controllers/authController")

const router = express.Router()

router.get("/auth/github", githubAuth)
router.get("/auth/github/callback", githubCallback)

module.exports = router
