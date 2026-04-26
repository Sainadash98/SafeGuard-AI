import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const redisOptions = {
  maxRetriesPerRequest: null   // ✅ VERY IMPORTANT
};

const redis = new Redis(redisUrl, redisOptions);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redis;