const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require("bcryptjs")

async function addUserToDataBase(
  firstName,
  lastName,
  username,
  password,
  profilePicture
) {
  try {
    const saltRounds = 10
    let hashedPassword = null

    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds)
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    })
    if (existingUser) {
      throw new Error("Username already exists")
    }

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName || "GitHub User",
        lastName: lastName || "",
        username: username,
        password: hashedPassword,
        profilePicture: profilePicture || null,
      },
    })
    return newUser
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

async function findUser(username) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: { id: true, username: true, password: true },
    })

    if (!user) {
      return null
    }
    return user
  } catch (error) {
    console.error("Error finding user:", error)
    throw error
  }
}

async function findUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: {
          include: {
            friend: true,
          },
        },
        sentRequests: {
          where: {
            status: "PENDING",
          },
          include: {
            receiver: true,
          },
        },
        receivedRequests: {
          where: {
            status: "PENDING",
          },
          include: {
            sender: true,
          },
        },
        posts: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
            dislikes: {
              include: {
                user: true,
              },
            },
            comments: {
              include: {
                user: true,
                likes: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      console.error("User not found with id:", userId)
      throw new Error("User not found")
    }

    const friends = user.friends.map((friendship) => ({
      id: friendship.friend.id,
      firstName: friendship.friend.firstName,
      lastName: friendship.friend.lastName,
      username: friendship.friend.username,
      profilePicture: friendship.friend.profilePicture,
    }))

    const friendRequests = user.receivedRequests.map((request) => ({
      id: request.id,
      username: request.sender.username,
      firstName: request.sender.firstName,
      lastName: request.sender.lastName,
      profilePicture: request.sender.profilePicture,
    }))

    const userPosts = user.posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: {
        id: post.user.id,
        firstName: post.user.firstName,
        lastName: post.user.lastName,
        username: post.user.username,
        profilePicture: post.user.profilePicture,
      },
      likes: post.likes.map((like) => ({
        userId: like.userId,
        username: like.user.username,
        firstName: like.user.firstName,
        lastName: like.user.lastName,
        profilePicture: like.user.profilePicture,
      })),
      dislikes: post.dislikes.map((dislike) => ({
        userId: dislike.userId,
        username: dislike.user.username,
        firstName: dislike.user.firstName,
        lastName: dislike.user.lastName,
        profilePicture: dislike.user.profilePicture,
      })),
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          firstName: comment.user.firstName,
          lastName: comment.user.lastName,
          username: comment.user.username,
          profilePicture: comment.user.profilePicture,
        },
        likes: comment.likes.map((like) => ({
          userId: like.userId,
          username: like.user.username,
          firstName: like.user.firstName,
          lastName: like.user.lastName,
          profilePicture: like.user.profilePicture,
        })),
      })),
    }))

    const friendIds = friends.map((friend) => friend.id)
    const friendsPosts = await prisma.post.findMany({
      where: {
        userId: {
          in: friendIds,
        },
      },
      include: {
        user: true,
        likes: {
          include: {
            user: true,
          },
        },
        dislikes: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    const formattedFriendsPosts = friendsPosts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: {
        id: post.user.id,
        firstName: post.user.firstName,
        lastName: post.user.lastName,
        username: post.user.username,
        profilePicture: post.user.profilePicture,
      },
      likes: post.likes.map((like) => ({
        userId: like.userId,
        username: like.user.username,
        firstName: like.user.firstName,
        lastName: like.user.lastName,
        profilePicture: like.user.profilePicture,
      })),
      dislikes: post.dislikes.map((dislike) => ({
        userId: dislike.userId,
        username: dislike.user.username,
        firstName: dislike.user.firstName,
        lastName: dislike.user.lastName,
        profilePicture: dislike.user.profilePicture,
      })),
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          firstName: comment.user.firstName,
          lastName: comment.user.lastName,
          username: comment.user.username,
          profilePicture: comment.user.profilePicture,
        },
        likes: comment.likes.map((like) => ({
          userId: like.userId,
          username: like.user.username,
          firstName: like.user.firstName,
          lastName: like.user.lastName,
          profilePicture: like.user.profilePicture,
        })),
      })),
    }))

    const allPosts = [...userPosts, ...formattedFriendsPosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )

    delete user.friends
    delete user.sentRequests
    delete user.receivedRequests
    delete user.posts

    return {
      user: {
        ...user,
        profilePicture: user.profilePicture,
      },
      friends,
      friendRequests,
      posts: allPosts,
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
    throw error
  }
}

async function sendFriendRequest(senderId, receiverId) {
  try {
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        AND: [{ senderId: senderId }, { receiverId: receiverId }],
      },
    })

    if (existingRequest) {
      throw new Error("Friend request already sent")
    }

    const newRequest = await prisma.friendRequest.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        status: "PENDING",
      },
    })

    return newRequest
  } catch (error) {
    console.error("Error sending friend request:", error)
    throw error
  }
}

async function acceptFriendRequest(requestId) {
  try {
    const friendRequest = await prisma.friendRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        sender: true,
        receiver: true,
      },
    })

    await prisma.friendship.create({
      data: {
        userId: friendRequest.senderId,
        friendId: friendRequest.receiverId,
      },
    })

    await prisma.friendship.create({
      data: {
        userId: friendRequest.receiverId,
        friendId: friendRequest.senderId,
      },
    })
  } catch (error) {
    console.error("Error accepting friend request:", error)
  }
}

async function declineFriendRequest(requestId) {
  try {
    await prisma.friendRequest.delete({
      where: {
        id: requestId,
      },
    })
  } catch (error) {
    console.error("Error rejecting friend request:", error)
  }
}

async function createPost(userId, content) {
  try {
    const newPost = await prisma.post.create({
      data: {
        userId,
        content,
      },
      include: {
        user: true,
        likes: true,
        dislikes: true,
        comments: true,
      },
    })
    return newPost
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

async function likePost(userId, postId) {
  try {
    await prisma.dislike.deleteMany({
      where: {
        AND: [{ userId: userId }, { postId: postId }],
      },
    })

    const existingLike = await prisma.like.findFirst({
      where: {
        AND: [{ userId: userId }, { postId: postId }],
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      const updatedLikes = await prisma.like.findMany({
        where: { postId: postId },
        select: { userId: true },
      })

      return {
        success: true,
        action: "like_removed",
        message: "Like removed successfully",
        likes: updatedLikes.map((like) => like.userId),
      }
    } else {
      const newLike = await prisma.like.create({
        data: {
          userId,
          postId,
        },
      })

      const updatedLikes = await prisma.like.findMany({
        where: { postId: postId },
        select: { userId: true },
      })

      return {
        success: true,
        action: "like_added",
        message: "Like added successfully",
        likes: updatedLikes.map((like) => like.userId),
      }
    }
  } catch (error) {
    console.error("Error liking post:", error)
    return {
      success: false,
      message: "Error liking post",
      error: error.message,
    }
  }
}

async function commentPost(userId, postId, comment) {
  try {
    const newComment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content: comment,
      },
    })
    return newComment
  } catch (error) {
    console.error("Error commenting on post:", error)
    throw error
  }
}

async function commentHeart(commentId, userId) {
  try {
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        commentId: commentId,
        userId: userId,
      },
    })

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      })
    } else {
      await prisma.commentLike.create({
        data: {
          commentId: commentId,
          userId: userId,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error hearting comment:", error)
    return { success: false, message: error.message }
  }
}

async function updateUserProfile(
  userId,
  firstName,
  lastName,
  bio,
  profilePicture
) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        bio: bio || undefined,
        profilePicture: profilePicture || undefined,
      },
    })
    return updatedUser
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

async function getAllUsers(userId) {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
        role: {
          not: "guest",
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePicture: true,
      },
    })
    return users
  } catch (error) {
    console.error("Error fetching all users:", error)
    throw error
  }
}

async function getAllFollowRequests(userId) {
  try {
    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
      },
      include: {
        receiver: true,
      },
    })

    return sentRequests
  } catch (error) {
    console.error("Error fetching sent friend requests:", error)
    throw error
  }
}

async function findGuestUser() {
  try {
    const guestUser = await prisma.user.findFirst({
      where: {
        role: "guest",
      },
    })

    return guestUser
  } catch (error) {
    console.error("Error fetching guest user:", error)
    throw error
  }
}

async function fetchGuestUserData() {
  try {
    const allPosts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicture: true,
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
            likes: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return {
      success: true,
      posts: allPosts,
    }
  } catch (error) {
    console.error("Error fetching all user data:", error)
    return {
      success: false,
      message: "Error fetching all user data",
      error: error.message,
    }
  }
}

async function getUsersForGuest() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "guest",
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePicture: true,
      },
    })
    return users
  } catch (error) {
    console.error("Error fetching users for guest:", error)
    throw error
  }
}
module.exports = {
  addUserToDataBase,
  findUser,
  findUserById,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  createPost,
  likePost,
  commentPost,
  commentHeart,
  updateUserProfile,
  getAllUsers,
  getAllFollowRequests,
  findGuestUser,
  fetchGuestUserData,
  getUsersForGuest,
}
