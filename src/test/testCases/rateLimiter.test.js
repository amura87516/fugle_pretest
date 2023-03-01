import request from "supertest";
import nock from "nock";

import app from "../../main/app.js";
import { TEST_USER_ID, MOCK_HACKER_NEWS, TEST_IP } from "../mock/mockData.js";
import { HACKER_NEWS_API } from "../mock/mockServerAndApi.js";
import {
	resetRedisForTesting,
	setUserCnt,
	setIpCnt,
} from "../../main/service/redis.js";

describe("Rate limiter with middleware and redis", () => {
	beforeEach(async () => {
		await resetRedisForTesting();
	});

	afterEach(() => {
		nock.cleanAll();
	});

	test("Excessed user rate limit", (done) => {
		HACKER_NEWS_API.reply(200, MOCK_HACKER_NEWS);

		setUserCnt(TEST_USER_ID, process.env.USER_RATE_LIMIT_TIMES);

		request(app)
			.get(`/data?user=${TEST_USER_ID}`)
			.then((response) => {
				expect(response.statusCode).toBe(429);
				expect(response.body).toEqual({
					ip: 0,
					id: process.env.USER_RATE_LIMIT_TIMES,
				});
				done();
			});
	});

	test("Excessed ip rate limit", (done) => {
		HACKER_NEWS_API.reply(200, MOCK_HACKER_NEWS);

		setIpCnt(TEST_IP, process.env.IP_RATE_LIMIT_TIMES);

		request(app)
			.get(`/data?user=${TEST_USER_ID}`)
			.then((response) => {
				expect(response.statusCode).toBe(429);
				expect(response.body).toEqual({
					ip: process.env.IP_RATE_LIMIT_TIMES,
					id: 0,
				});
				done();
			});
	});
});
