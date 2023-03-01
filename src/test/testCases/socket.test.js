import { io as Client } from "socket.io-client";

import {
	resetRedisForTesting,
	addNewPriceToRedis,
} from "../../main/service/redis.js";
import {
	buildClientSocket,
	broadcast,
	unsubscribeAll,
	setExistSocketAndChannelForTesting,
	getSocketStatusForTesting,
	resetSocketStatusForTesting,
} from "../../main/socket/client.js";
import {
	MOCK_CURRENCY_PARE_DATA,
	expectedOhlcForSingleData,
	currencyDataHistory,
	expectedOhlcForMultipleData,
	TEST_CURRENCY_PAIR,
} from "../mock/mockData.js";
import {
	buildDummyUpstreamServer,
	buildSimpleSocketServer,
} from "../mock/mockServerAndApi.js";

describe("Socket", () => {
	let upstream,
		proxy,
		upstream2proxySocket,
		proxy2upstreamSocket,
		proxy2clientSocket,
		client2proxySocket;

	beforeAll((done) => {
		// build upstream socket server
		let upstreamPort;
		[upstream, upstreamPort] = buildSimpleSocketServer();
		upstream = buildDummyUpstreamServer(upstream);

		// build socket between upstream server and proxy serber
		upstream.on("connection", (socket) => {
			upstream2proxySocket = socket;
		});
		proxy2upstreamSocket = new Client(`ws://localhost:${upstreamPort}`);

		// broadcast all event from upstream server to client
		proxy2upstreamSocket.on(TEST_CURRENCY_PAIR, (event) =>
			broadcast(event)
		);

		// build proxy socket server
		let proxyPort;
		[proxy, proxyPort] = buildSimpleSocketServer();
		proxy = buildClientSocket(proxy, proxy2upstreamSocket);

		// build sockets between proxy server and client
		proxy.of("/streaming").on("connection", (socket) => {
			proxy2clientSocket = socket;
		});

		client2proxySocket = new Client(
			`http://localhost:${proxyPort}/streaming`
		);

		client2proxySocket.on("connect", done);
	});

	beforeEach((done) => {
		// flush redis data
		resetRedisForTesting();

		// reset ,apping between sockets and currencies
		resetSocketStatusForTesting();
		done();
	});

	afterAll(() => {
		upstream.close();
		proxy.close();
		proxy2upstreamSocket.close();
		client2proxySocket.close();
	});

	it("subscribe", (done) => {
		// act
		client2proxySocket.emit(
			"subscribe",
			JSON.stringify([TEST_CURRENCY_PAIR])
		);

		// assert
		client2proxySocket.on(TEST_CURRENCY_PAIR, (arg) => {
			arg = JSON.parse(arg);
			expect(arg).toBe("subscribe btcusd successed");

			const [userByCurrencyPair, currencyPairByUser] =
				getSocketStatusForTesting();
			expect(userByCurrencyPair.size).toBe(1);
			expect(currencyPairByUser.size).toBe(1);

			client2proxySocket.off(TEST_CURRENCY_PAIR);
			done();
		});
	});

	it("unsubscribe", (done) => {
		// prepare
		setExistSocketAndChannelForTesting(
			proxy2clientSocket,
			TEST_CURRENCY_PAIR
		);

		// act
		client2proxySocket.emit(
			"unsubscribe",
			JSON.stringify([TEST_CURRENCY_PAIR])
		);

		// assert
		client2proxySocket.on(TEST_CURRENCY_PAIR, (arg) => {
			arg = JSON.parse(arg);
			expect(arg).toBe("unsubscribe btcusd successed");

			const [userByCurrencyPair, currencyPairByUser] =
				getSocketStatusForTesting();
			expect(userByCurrencyPair.size).toBe(0);
			expect(currencyPairByUser.size).toBe(0);

			client2proxySocket.off(TEST_CURRENCY_PAIR);
			done();
		});
	});

	it("disconnection", (done) => {
		// prepare
		setExistSocketAndChannelForTesting(
			proxy2clientSocket,
			TEST_CURRENCY_PAIR
		);

		// act
		unsubscribeAll(proxy2upstreamSocket, proxy2clientSocket);

		// assert
		const [userByCurrencyPair, currencyPairByUser] =
			getSocketStatusForTesting();

		expect(userByCurrencyPair.size).toBe(0);
		expect(currencyPairByUser.size).toBe(0);

		client2proxySocket.off(TEST_CURRENCY_PAIR);
		done();
	});

	it("broadcast", (done) => {
		// prepare
		setExistSocketAndChannelForTesting(
			proxy2clientSocket,
			TEST_CURRENCY_PAIR
		);

		// act
		upstream2proxySocket.emit(TEST_CURRENCY_PAIR, {
			data: JSON.stringify(MOCK_CURRENCY_PARE_DATA),
		});

		// assert
		client2proxySocket.on(TEST_CURRENCY_PAIR, (arg) => {
			arg = JSON.parse(arg);
			expect(arg).toStrictEqual(expectedOhlcForSingleData);
			client2proxySocket.off(TEST_CURRENCY_PAIR);
			done();
		});
	});

	it("OHLC", (done) => {
		// prepare
		currencyDataHistory.forEach((data) =>
			addNewPriceToRedis(
				TEST_CURRENCY_PAIR,
				data.data.price,
				data.data.timestamp,
				process.env.OHLC_PRECISION_SEC
			)
		);

		setExistSocketAndChannelForTesting(
			proxy2clientSocket,
			TEST_CURRENCY_PAIR
		);

		// act
		upstream2proxySocket.emit(TEST_CURRENCY_PAIR, {
			data: JSON.stringify(MOCK_CURRENCY_PARE_DATA),
		});

		// assert
		client2proxySocket.on(TEST_CURRENCY_PAIR, (arg) => {
			arg = JSON.parse(arg);

			expect(arg).toStrictEqual(expectedOhlcForMultipleData);

			client2proxySocket.off(TEST_CURRENCY_PAIR);
			done();
		});
	});
});
