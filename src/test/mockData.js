import nock from "nock";
import { URL } from "url";
import dotenv from "dotenv";

dotenv.config();

export const MOCK_HACKER_NEWS = [34938271, 34928577, 34940505, 34942451];

export const TEST_USER_ID = 1;

const url = new URL(process.env.HACKER_NEWS_URL);
export const HACKER_NEWS_API = nock(`${url.protocol}//${url.hostname}`)
	.get(url.pathname)
	.query(url.searchParams);
