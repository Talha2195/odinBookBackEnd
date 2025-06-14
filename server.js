const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const session = require("express-session")
const passport = require("passport")
const authRoutes = require("./server/routes/authRoute")
const postRouter = require("./server/routes/postRoutes")
const getRouter = require("./server/routes/getRoutes")
const RedisStore = require("connect-redis")(session)
const redis = require("redis")

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
  },
})
redisClient.connect().catch(console.error)

const {
  githubAuth,
  githubCallback,
  loadUserProfile,
} = require("./controllers/authController")

const app = express()
const port = process.env.PORT || 5000

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  credentials: true,
}

app.use(cors(corsOptions))
app.use(bodyParser.json())

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 3600000,
    },
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(authRoutes)
app.use(postRouter)
app.use(getRouter)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
