const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function seedGuestUser() {
  try {
    const guestUser = await prisma.user.upsert({
      where: { username: "guest" },
      update: {},
      create: {
        firstName: "Guest",
        lastName: "User",
        username: "guest",
        password: null,
        role: "guest",
        status: "active",
      },
    })
  } catch (error) {
    console.error("Error adding guest user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedGuestUser()
