const { faker } = require("@faker-js/faker")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function createRandomUser() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    bio: faker.lorem.sentence(),
    profilePicture: faker.image.avatar(),
  }
}

async function createRandomPost(userId) {
  return {
    userId,
    content: faker.lorem.paragraph(),
    createdAt: new Date(),
  }
}

async function createRandomLike(userId, postId) {
  return {
    userId,
    postId,
  }
}

async function createRandomDislike(userId, postId) {
  return {
    userId,
    postId,
  }
}

async function createRandomComment(userId, postId) {
  return {
    userId,
    postId,
    content: faker.lorem.sentence(),
    createdAt: new Date(),
  }
}

async function createRandomCommentLike(userId, commentId) {
  return {
    userId,
    commentId,
  }
}

async function generateFakeDatabase() {
  const users = []
  const posts = []

  for (let i = 0; i < 10; i++) {
    const userData = await createRandomUser()
    const user = await prisma.user.create({ data: userData })
    users.push(user)
  }

  for (let i = 0; i < 5; i++) {
    const user = users[i]
    const postData = await createRandomPost(user.id)
    const post = await prisma.post.create({ data: postData })

    const randomUsersForLikes = users
      .filter((u) => u.id !== user.id)
      .slice(0, 3)
    for (const likeUser of randomUsersForLikes) {
      const likeData = await createRandomLike(likeUser.id, post.id)
      await prisma.like.create({ data: likeData })
    }

    const randomUsersForDislikes = users
      .filter((u) => u.id !== user.id)
      .slice(0, 2)
    for (const dislikeUser of randomUsersForDislikes) {
      const dislikeData = await createRandomDislike(dislikeUser.id, post.id)
      await prisma.dislike.create({ data: dislikeData })
    }

    const randomUsersForComments = users
      .filter((u) => u.id !== user.id)
      .slice(0, 2)
    for (const commentUser of randomUsersForComments) {
      const commentData = await createRandomComment(commentUser.id, post.id)
      const comment = await prisma.comment.create({ data: commentData })

      const randomUsersForCommentLikes = users
        .filter((u) => u.id !== commentUser.id)
        .slice(0, 2)
      for (const likeUser of randomUsersForCommentLikes) {
        const commentLikeData = await createRandomCommentLike(
          likeUser.id,
          comment.id
        )
        await prisma.commentLike.create({ data: commentLikeData })
      }
    }

    posts.push(post)
  }
}

generateFakeDatabase()
  .catch((error) => {
    console.error("Error populating fake database:", error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
