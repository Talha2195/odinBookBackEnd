const express = require("express")
const postRouter = express.Router()
const controller = require("../../controllers/controllers")
const { signUpVal } = require("../validators/signUpVal")
const authMiddleware = require("../../authMiddleware")
const restrictToRoles = require("../../roleBasedAuth")

postRouter.post("/signup", signUpVal, controller.signUserUp)
postRouter.post("/login", controller.logUserIn)

postRouter.post("/guestLogin", controller.handleGuestUser)

postRouter.post("/logout", authMiddleware, controller.logUserOut)
postRouter.post(
  "/sendReq",
  authMiddleware,
  restrictToRoles(["regular"]),
  controller.sendFreidnRequest
)
postRouter.post(
  "/acceptReq",
  authMiddleware,
  restrictToRoles(["regular"]),
  controller.acceptRequest
)
postRouter.post(
  "/declineReq",
  authMiddleware,
  restrictToRoles(["regular"]),
  controller.declineRequest
)
postRouter.post(
  "/userPost",
  authMiddleware,
  restrictToRoles(["guest", "regular"]),
  controller.userPostController
)
postRouter.post(
  "/like",
  authMiddleware,
  restrictToRoles(["guest", "regular"]),
  controller.likeRequest
)

postRouter.post(
  "/comment",
  authMiddleware,
  restrictToRoles(["guest", "regular"]),
  controller.commentRequest
)
postRouter.post(
  "/commentHeartRequest",
  authMiddleware,
  restrictToRoles(["guest", "regular"]),
  controller.commentHeart
)
postRouter.post(
  "/editProfile",
  authMiddleware,
  restrictToRoles(["regular"]),
  controller.editProfile
)

module.exports = postRouter
