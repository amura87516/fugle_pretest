import { subscribeBitstamp, unsubscribeBitstamp } from "./bitstamp.js";
import {
	addNewPriceToRedis,
	getPricesHistoryFromRedis,
} from "../service/redis.js";

// mapping between sockets and channels
let userByCurrencyPair = new Map();
let currencyPairByUser = new Map();

// subscribe

const addUserByCurrencyPair = (ws, socket, currencyPairs) => {
	currencyPairs.forEach((currencyPair) => {
		if (userByCurrencyPair.has(currencyPair)) {
			userByCurrencyPair.get(currencyPair).add(socket);
		} else {
			subscribeBitstamp(ws, currencyPair);
			userByCurrencyPair.set(currencyPair, new Set([socket]));
		}
	});
};

const addCurrencyPairByUser = (socket, currencyPairs) => {
	if (currencyPairByUser.has(socket)) {
		currencyPairs.forEach((currencyPair) => {
			currencyPairByUser.get(socket).add(currencyPair);
		});
	} else {
		currencyPairByUser.set(socket, new Set(currencyPairs));
	}
};

const subscribe = (ws, socket, currencyPairs) => {
	addUserByCurrencyPair(ws, socket, currencyPairs);
	addCurrencyPairByUser(socket, currencyPairs);
};

// unsubscribe

const unsubscribe = (ws, socket, currencyPairs) => {
	currencyPairs.forEach((currencyPair) => {
		currencyPairByUser.get(socket)?.delete(currencyPair);
		if (currencyPairByUser.get(socket).size == 0) {
			currencyPairByUser.delete(socket);
		}

		userByCurrencyPair.get(currencyPair)?.delete(socket);
		if (userByCurrencyPair.get(currencyPair).size == 0) {
			userByCurrencyPair.delete(currencyPair);
			unsubscribeBitstamp(ws, currencyPair);
		}

		socket.emit(
			currencyPair,
			JSON.stringify(`unsubscribe ${currencyPair} successed`)
		);
	});
};

export const unsubscribeAll = (ws, socket) => {
	currencyPairByUser.delete(socket);

	userByCurrencyPair.forEach((sockets, currencyPair) => {
		if (sockets.has(socket)) {
			sockets.delete(socket);
		}
		if (sockets.size == 0) {
			userByCurrencyPair.delete(currencyPair);
			unsubscribeBitstamp(ws, currencyPair);
		}
	});
};

const calOhlc = (prices) => {
	return {
		first: prices[0],
		highest: Math.max(...prices),
		lowest: Math.min(...prices),
		latest: prices.at(-1),
	};
};

// broadcast

const sendSubscribeSuccessToUsers = (channel) => {
	userByCurrencyPair.get(channel)?.forEach((socket) => {
		socket.emit(channel, JSON.stringify(`subscribe ${channel} successed`));
	});
};

const sendOhlcToUsers = async (channel, data) => {
	// append timestamp info if it wasn't given
	const timestamp = data.data.timestamp || Math.floor(+new Date() / 1000);

	await addNewPriceToRedis(
		channel,
		data.data.price,
		timestamp,
		process.env.OHLC_PRECISION_SEC
	);

	const ohlc = calOhlc(await getPricesHistoryFromRedis(channel, timestamp));

	userByCurrencyPair.get(channel)?.forEach((socket) => {
		socket.emit(
			channel,
			JSON.stringify({
				...ohlc,
				current: data.data.price,
			})
		);
	});
};

export const broadcast = async (event) => {
	const data = JSON.parse(event.data);
	const channel = data.channel.split("_")[2];

	if (data.event == "bts:subscription_succeeded") {
		sendSubscribeSuccessToUsers(channel);
	} else {
		sendOhlcToUsers(channel, data);
	}
};

// build final socket server

export const buildClientSocket = (io, ws) => {
	io.of("/streaming").on("connection", (socket) => {
		socket.on("subscribe", (currencyPairs) => {
			subscribe(ws, socket, JSON.parse(currencyPairs));
		});

		socket.on("unsubscribe", (currencyPairs) =>
			unsubscribe(ws, socket, JSON.parse(currencyPairs))
		);

		socket.on("disconnect", () => {
			unsubscribeAll(ws, socket);
		});
	});

	return io;
};

// functions for preparing testing environment

export const setExistSocketAndChannelForTesting = (socket, currencyPair) => {
	userByCurrencyPair.set(currencyPair, new Set([socket]));
	currencyPairByUser.set(socket, new Set([currencyPair]));
};

export const getSocketStatusForTesting = () => {
	return [userByCurrencyPair, currencyPairByUser];
};

export const resetSocketStatusForTesting = () => {
	userByCurrencyPair.clear();
	currencyPairByUser.clear();
};
