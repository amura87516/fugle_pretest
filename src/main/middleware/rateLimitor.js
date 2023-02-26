import dotenv from "dotenv";
import {
	getUserCnt,
	getIpCnt,
	incUserCnt,
	incIpCnt,
} from "../service/redis.js";

dotenv.config();
const USER_RATE_LIMIT_TIMES = process.env.USER_RATE_LIMIT_TIMES;
const IP_RATE_LIMIT_TIMES = process.env.IP_RATE_LIMIT_TIMES;
const RATE_LIMIT_PRECISION_SEC = process.env.RATE_LIMIT_PRECISION_SEC;

// Rate limit middleware
export const rateLimiterMiddleware = async (req, res, next) => {
	const ipAddress = req.ip;
	const userId = req.query.user;

	// Check IP rate limit
	const ipCount = await getIpCnt(ipAddress);
	let userCount = null;
	if (userId) {
		userCount = await getUserCnt(userId);
	}

	if (ipCount && +ipCount >= IP_RATE_LIMIT_TIMES) {
		res.status(429).json({ ip: ipCount, id: userCount });
		return;
	}

	// Check user rate limit
	if (userId) {
		if (userCount && parseInt(userCount) >= USER_RATE_LIMIT_TIMES) {
			res.status(429).json({
				ip: ipCount,
				id: userCount,
			});
			return;
		}
	}

	// Update IP and user rate limit counters
	await incIpCnt(ipAddress, ipCount, RATE_LIMIT_PRECISION_SEC);
	if (userId) {
		await incUserCnt(userId, userCount, RATE_LIMIT_PRECISION_SEC);
	}

	next();
};
