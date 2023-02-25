import dotenv from "dotenv";
import { redisClient } from "../service/redis.js";

// Redis client setup

await redisClient.connect();

dotenv.config();
const USER_RATE_LIMIT_TIMES = process.env.USER_RATE_LIMIT_TIMES;
const IP_RATE_LIMIT_TIMES = process.env.IP_RATE_LIMIT_TIMES;
const RATE_LIMIT_PRECISION_SEC = process.env.RATE_LIMIT_PRECISION_SEC;

// Rate limit middleware
export const rateLimiterMiddleware = async (req, res, next) => {
	const ipAddress = req.ip;
	const userId = req.query.user;

	const minutes = new Date().getMinutes();

	const ipKey = `ip_${ipAddress}_${minutes}`;
	const userKey = `user_${userId}_${minutes}`;

	// Check IP rate limit
	const ipCount = await redisClient.get(ipKey);
	if (ipCount && +ipCount > IP_RATE_LIMIT_TIMES) {
		res.status(429).json({ ip: ipAddress, id: userId });
		return;
	}

	// Check user rate limit
	if (userId) {
		var userCount = await redisClient.get(userKey);
		if (userCount && parseInt(userCount) > USER_RATE_LIMIT_TIMES) {
			res.status(429).json({
				ip: ipAddress,
				id: userId,
			});
			return;
		}
	}

	// Update IP and user rate limit counters

	await redisClient.set(ipKey, ipCount ? +ipCount + 1 : 1);
	await redisClient.expire(ipKey, RATE_LIMIT_PRECISION_SEC);

	if (userId) {
		await redisClient.set(userKey, userCount ? +userCount + 1 : 1);
		await redisClient.expire(userKey, RATE_LIMIT_PRECISION_SEC);
	}

	next();
};
