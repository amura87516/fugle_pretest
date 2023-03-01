// test data for hacker news restful api
export const MOCK_HACKER_NEWS = [34938271, 34928577, 34940505, 34942451];

export const TEST_USER_ID = 1;
export const TEST_IP = "::ffff:127.0.0.1";

// test data for socket server
export const TEST_CURRENCY_PAIR = "btcusd";

export const MOCK_CURRENCY_PARE_DATA = {
	channel: "live_trades_btcusd",
	data: {
		price: 1,
		timestamp: "100",
	},
	event: "trade",
};

export const currencyDataHistory = [
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

// expected response from socket

export const expectedOhlcForSingleData = {
	current: 1,
	first: 1,
	highest: 1,
	lowest: 1,
	latest: 1,
};

export const expectedOhlcForMultipleData = {
	current: 1,
	first: 4,
	highest: 5,
	lowest: 1,
	latest: 1,
};
