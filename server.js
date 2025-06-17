import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import session from "express-session"
import passport from "passport"
import authRoutes from "./server/routes/authRoute.js"
import postRouter from "./server/routes/postRoutes.js"
import getRouter from "./server/routes/getRoutes.js"
import { RedisStore } from "connect-redis"
import redis from "redis"
import { githubAuth, githubCallback } from "./controllers/authController.js"
import { loadUserProfile } from "./controllers/controllers.js"

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
  },
})
redisClient.connect().catch(console.error)

const app = express()
const port = process.env.PORT || 5000

const allowedOrigins = [
  "http://localhost:3000",
  "https://odin-book-front-end-ikcw.vercel.app",
]

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  return /^https:\/\/odin-book-front-end-ikcw.*\.vercel\.app$/.test(origin)
}

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Incoming origin:", origin)
    if (isAllowedOrigin(origin)) {
      callback(null, true)
    } else {
      console.error("Not allowed by CORS:", origin)
      callback(new Error("Not allowed by CORS: " + origin))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(bodyParser.json())

app.set("trust proxy", 1)

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
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
