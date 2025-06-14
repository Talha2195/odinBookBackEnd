import redis from "redis"

const client = redis.createClient({ url: "redis://localhost:6379" })

client.on("error", (err) => console.error("Redis Client Error", err))

await client.connect()

await client.set("test-key", "hello")
const value = await client.get("test-key")
console.log("Value from Redis:", value)

await client.quit()
