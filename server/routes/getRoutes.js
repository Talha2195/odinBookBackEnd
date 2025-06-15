import express from "express"
import * as controller from "../../controllers/controllers.js"
import authMiddleware from "../../authMiddleware.js"
import restrictToRoles from "../../roleBasedAuth.js"

const getRouter = express.Router()

getRouter.get(
  "/profile",
  authMiddleware,
  restrictToRoles(["guest", "regular"]),
  controller.loadUserProfile
)

getRouter.get(
  "/allUsers",
  authMiddleware,
  restrictToRoles(["guest", "regular"]),
  controller.getAllUsers
)

getRouter.get(
  "/allFollowers",
  authMiddleware,
  restrictToRoles(["guest", "regular"]),
  controller.getAllFollowers
)

getRouter.get(
  "/guestLogin",
  restrictToRoles(["guest"]),
  controller.handleGuestUser
)

export default getRouter
