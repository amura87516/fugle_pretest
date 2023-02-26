import { subscribeBitstamp, unsubscribeBitstamp } from "./bitstamp.js";

let userByCurrencyPair = new Map();
let currencyPairByUser = new Map();

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

export const broadcast = (event) => {
	const data = JSON.parse(event.data);
	const cahnnel = data.channel.split("_")[2];
	userByCurrencyPair.get(cahnnel)?.forEach((socket) => {
		socket.emit(cahnnel, JSON.stringify(data.data));
	});
};

const unsubscribe = (ws, socket, currencyPairs) => {
	currencyPairs.forEach((currencyPair) => {
		if (currencyPairByUser.has(socket)) {
			currencyPairByUser.get(socket).delete(currencyPair);
		}
		if (userByCurrencyPair.has(currencyPair)) {
			userByCurrencyPair.get(currencyPair).delete(socket);
			if (userByCurrencyPair.get(currencyPair).size == 0) {
				userByCurrencyPair.delete(currencyPair);
				unsubscribeBitstamp(ws, currencyPair);
			}
		}
	});
};

const unsubscribeAll = (ws, socket) => {
	currencyPairByUser.get(socket)?.forEach((currencyPair) => {
		userByCurrencyPair.get(currencyPair).delete(socket);
		if (userByCurrencyPair.get(currencyPair).size == 0) {
			userByCurrencyPair.delete(currencyPair);
			unsubscribeBitstamp(ws, currencyPair);
		}
	});
	currencyPairByUser.delete(socket);
};

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
