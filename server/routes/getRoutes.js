const express = require("express")
const getRouter = express.Router()
const controller = require("../../controllers/controllers")
const authMiddleware = require("../../authMiddleware")
const restrictToRoles = require("../../roleBasedAuth")

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

module.exports = getRouter
