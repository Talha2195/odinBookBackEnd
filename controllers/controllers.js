import * as db from "../db/prismaClient.js"
import bcrypt from "bcrypt"
import { validationResult } from "express-validator"
import fs from "fs"
import path from "path"

export async function signUserUp(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Please fix the above errors",
      errors: errors.array(),
    })
  }

  const { firstName, lastName, username, password } = req.body
  try {
    const newUser = await db.addUserToDataBase(
      firstName,
      lastName,
      username,
      password
    )
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    })
  }
}

export async function logUserIn(req, res) {
  const { username, password } = req.body

  try {
    const user = await db.findUser(username)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      })
    }

    req.session.user = user
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err)
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" })
      }
      return res.status(200).json({
        success: true,
        data: user,
      })
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal server error")
  }
}

export async function loadUserProfile(req, res) {
  try {
    const userId = req.user.id

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }
    if (req.user.role === "guest") {
      const guestData = await db.fetchGuestUserData()

      if (!guestData.success) {
        return res.status(500).json({
          success: false,
          message: guestData.message,
        })
      }

      return res.status(200).json({
        success: true,
        user: {
          user: {
            ...req.user,
          },
          posts: guestData.posts,
        },
      })
    }

    const user = await db.findUserById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const userWithDetails = {
      user: {
        ...user,
      },
      posts: user.posts || [],
      friendRequests: user.receivedRequests || [],
      likes: user.likes || [],
      dislikes: user.dislikes || [],
    }

    return res.status(200).json({
      success: true,
      user: userWithDetails,
    })
  } catch (error) {
    console.error("Error in loadUserProfile:", error)
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" })
  }
}

export async function sendFreidnRequest(req, res) {
  const { friendName } = req.body
  const userId = req.user.id
  try {
    const friend = await db.findUser(friendName)
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "Friend not found",
      })
    }

    const friendRequest = await db.sendFriendRequest(userId, friend.id)

    return res.status(200).json({
      success: true,
      message: "Friend request sent",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal server error")
  }
}

export async function logUserOut(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error logging out",
      })
    }
    res.clearCookie("connect.sid")
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  })
}

export async function acceptRequest(req, res) {
  const { requestId } = req.body
  try {
    result = await db.acceptFriendRequest(requestId)
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      })
    }
    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: `Error accepting friend request: ${error.message}`,
    })
  }
}

export async function declineRequest(req, res) {
  const { requestId } = req.body
  try {
    result = await db.declineFriendRequest(requestId)
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      })
    }
    return res.status(200).json({
      success: true,
      message: "Friend request declined",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: `Error declining friend request: ${error.message}`,
    })
  }
}

export async function userPostController(req, res) {
  const { post } = req.body
  const userId = req.user?.id

  try {
    const newPost = await db.createPost(userId, post)
    if (!newPost) {
      return res.status(404).json({
        success: false,
        message: "Post not created",
      })
    }

    return res.status(201).json({
      success: true,
      message: "Post created",
      post: newPost,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return res.status(500).json({
      success: false,
      message: "Error creating post",
    })
  }
}

export async function likeRequest(req, res) {
  const { postId } = req.body
  const userId = req.user?.id

  try {
    const result = await db.likePost(userId, postId)
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || "Post not found",
      })
    }

    return res.status(200).json({
      success: true,
      action: result.action,
      message: result.message,
      like: result.like || null,
    })
  } catch (error) {
    console.error("Error in likeRequest controller:", error)
    return res.status(500).json({
      success: false,
      message: "Error liking post",
      error: error.message,
    })
  }
}

export async function commentRequest(req, res) {
  const { postId, comment } = req.body
  const userId = req.user.id
  try {
    const post = await db.commentPost(userId, postId, comment)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }
    return res.status(200).json({
      success: true,
      message: "Comment added",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error commenting on post",
    })
  }
}

export async function commentHeart(req, res) {
  const { commentId } = req.body
  const userId = req.user.id
  try {
    const comment = await db.commentHeart(userId, commentId)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }
    return res.status(200).json({
      success: true,
      message: "Comment liked",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error liking comment",
    })
  }
}

export async function editProfile(req, res) {
  const { firstName, lastName, bio } = req.body
  const userId = req.user.id
  try {
    const updatedUser = await db.updateUserProfile(
      userId,
      firstName,
      lastName,
      bio
    )
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
    })
  }
}

export async function getAllUsers(req, res) {
  const userId = req.user?.id
  const userRole = req.user?.role

  try {
    let users
    if (userRole === "guest") {
      users = await db.getUsersForGuest()
    } else {
      users = await db.getAllUsers(userId)
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      })
    }

    return res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
    })
  }
}

export async function getAllFollowers(req, res) {
  const userId = req.user.user?.id
  try {
    const followers = await db.getAllFollowRequests(userId)
    if (!followers) {
      return res.status(404).json({
        success: false,
        message: "No followers found",
      })
    }
    return res.status(200).json({
      success: true,
      data: followers,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error fetching followers",
    })
  }
}

export async function handleGuestUser(req, res) {
  try {
    const guestUser = {
      id: "guest",
      firstName: "Guest",
      lastName: "User",
      username: "guest",
      role: "guest",
      profilePicture: null,
    }

    req.session.user = guestUser
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err)
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Logged in as guest",
        user: guestUser,
      })
    })
  } catch (error) {
    console.error("Error handling guest login:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
