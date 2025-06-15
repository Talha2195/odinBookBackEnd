import express from "express"
import { githubAuth, githubCallback } from "../../controllers/authController.js"

const router = express.Router()

router.get("/auth/github", githubAuth)
router.get("/auth/github/callback", githubCallback)

export default router
