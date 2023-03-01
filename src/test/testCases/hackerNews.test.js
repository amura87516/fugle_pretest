import request from "supertest";
import nock from "nock";

import app from "../../main/app.js";
import { MOCK_HACKER_NEWS, TEST_USER_ID } from "../mock/mockData.js";
import { HACKER_NEWS_API } from "../mock/mockServerAndApi.js";
import { resetRedisForTesting } from "../../main/service/redis.js";

describe("Fetch data from hacker news", () => {
	beforeEach(async () => {
		await resetRedisForTesting();
	});

	afterEach(() => {
		nock.cleanAll();
	});

	test("Get hacker news data", (done) => {
		HACKER_NEWS_API.reply(200, MOCK_HACKER_NEWS);

		request(app)
			.get(`/data?user=${TEST_USER_ID}`)
			.then((response) => {
				expect(response.statusCode).toBe(200);
				expect(Array.isArray(response.body["result"])).toEqual(true);
				expect(response.body["result"]).toEqual(MOCK_HACKER_NEWS);
				done();
			});
	});

	test("Get unexpected data from hacker news", (done) => {
		HACKER_NEWS_API.reply(200, {});

		request(app)
			.get(`/data?user=${TEST_USER_ID}`)
			.then((response) => {
				expect(response.statusCode).toBe(500);
				expect(response.body).toEqual(
					"Got unexpected data from upstream server"
				);
				done();
			});
	});

	test("Fail to get data from hacker news", (done) => {
		HACKER_NEWS_API.reply(500);

		request(app)
			.get(`/data?user=${TEST_USER_ID}`)
			.then((response) => {
				expect(response.statusCode).toBe(500);
				done();
			});
	});
});
