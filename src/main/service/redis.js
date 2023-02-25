import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = redis.createClient({
	url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on("connect", () => {
	console.log("Connected to Redis server");
});

redisClient.on("error", (err) => {
	console.error("Error connecting to Redis server:", err);
});
