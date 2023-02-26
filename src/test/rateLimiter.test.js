import request from "supertest";
import nock from "nock";

import app from "../main/app.js";
import { HACKER_NEWS_API, TEST_USER_ID, MOCK_HACKER_NEWS } from "./mockData.js";
import { resetRedis, setUserCnt, setIpCnt } from "../main/service/redis.js";

describe("Fetch data from hacker news", () => {
	beforeEach(async () => {
		await resetRedis();
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

		setIpCnt("::ffff:127.0.0.1", process.env.IP_RATE_LIMIT_TIMES);

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
