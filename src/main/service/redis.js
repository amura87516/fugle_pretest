import redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new redis({
	port: process.env.REDIS_PORT,
	host: process.env.REDIS_HOST,
});

redisClient.on("connect", () => {
	console.log("Connected to Redis server");
});

redisClient.on("error", (err) => {
	console.error("Error connecting to Redis server:", err);
});

export const getUserCnt = (userId) => {
	const minutes = new Date().getMinutes();
	const userKey = `user_${userId}_${minutes}`;
	return redisClient.get(userKey);
};

export const getIpCnt = (ip) => {
	const minutes = new Date().getMinutes();
	const ipKey = `ip_${ip}_${minutes}`;
	return redisClient.get(ipKey);
};

export const incUserCnt = async (
	userId,
	userCount,
	RATE_LIMIT_PRECISION_SEC
) => {
	const minutes = new Date().getMinutes();
	const userKey = `user_${userId}_${minutes}`;
	await redisClient.set(userKey, userCount ? +userCount + 1 : 1);
	await redisClient.expire(userKey, RATE_LIMIT_PRECISION_SEC);
};

export const incIpCnt = async (ip, ipCount, RATE_LIMIT_PRECISION_SEC) => {
	const minutes = new Date().getMinutes();
	const ipKey = `ip_${ip}_${minutes}`;
	await redisClient.set(ipKey, ipCount ? +ipCount + 1 : 1);
	await redisClient.expire(ipKey, RATE_LIMIT_PRECISION_SEC);
};

export const addNewPrice = async (
	channel,
	price,
	timestamp,
	OHCL_PRECISION_SEC
) => {
	const minutes = Math.floor(timestamp / 60) % 10;
	const key = `price_${channel}_${minutes}`;
	await redisClient.rpush(key, price);
	await redisClient.expire(key, OHCL_PRECISION_SEC);
};

export const getPrices = async (channel) => {
	const minutes = new Date().getMinutes();
	const key = `price_${channel}_${minutes}`;
	return (await redisClient.lrange(key, 0, -1)).map((price) => +price);
};

export const resetRedis = async () => {
	await redisClient.flushall();
};

export const setUserCnt = async (userId, usercnt) => {
	const minutes = new Date().getMinutes();
	const userKey = `user_${userId}_${minutes}`;
	await redisClient.set(userKey, usercnt);
};

export const setIpCnt = async (ip, ipCnt) => {
	const minutes = new Date().getMinutes();
	const ipKey = `ip_${ip}_${minutes}`;
	await redisClient.set(ipKey, ipCnt);
};
