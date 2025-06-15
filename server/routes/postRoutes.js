import express from "express"
import * as controller from "../../controllers/controllers.js"
import { signUpVal } from "../validators/signUpVal.js"
import authMiddleware from "../../authMiddleware.js"
import restrictToRoles from "../../roleBasedAuth.js"

const postRouter = express.Router()

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

export default postRouter
