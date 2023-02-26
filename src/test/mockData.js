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

export const btcusd = {
	channel: "live_trades_btcusd",
	data: {
		price: 1,
		timestamp: "100",
	},
	event: "trade",
};

export const expectedOhcl = {
	firstPrice: 1,
	highestPrice: 1,
	lowestPrice: 1,
	latestPrice: 1,
};

export const history = [
	{
		channel: "live_trades_btcusd",
		data: {
			price: 1,
			timestamp: "0",
		},
		event: "trade",
	},
	{
		channel: "live_trades_btcusd",
		data: {
			price: 2,
			timestamp: "10",
		},
		event: "trade",
	},
	{
		channel: "live_trades_btcusd",
		data: {
			price: 3,
			timestamp: "20",
		},
		event: "trade",
	},
	{
		channel: "live_trades_btcusd",
		data: {
			price: 4,
			timestamp: "70",
		},
		event: "trade",
	},
	{
		channel: "live_trades_btcusd",
		data: {
			price: 5,
			timestamp: "80",
		},
		event: "trade",
	},
];

export const expectedOhcl2 = {
	firstPrice: 4,
	highestPrice: 5,
	lowestPrice: 1,
	latestPrice: 1,
};

export const buildDummyBitstamp = (bitstamp) => {
	bitstamp.on("connection", (socket) => {
		socket.on("message", (data) => {
			data = JSON.parse(data);
			const currencyPair = data.data.channel.split("_")[2];
			socket.emit(currencyPair, {
				data: JSON.stringify({
					event: "bts:subscription_succeeded",
					data: {},
					channel: `live_trades_${currencyPair}`,
				}),
			});
		});
	});

	return bitstamp;
};
