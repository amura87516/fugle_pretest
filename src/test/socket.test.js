import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";

import {
	buildClientSocket,
	setExistSocketAndChannel,
} from "../main/socket/client.js";
import { broadcast } from "../main/socket/client.js";
import {
	buildDummyBitstamp,
	btcusd,
	expectedOhcl,
	history,
	expectedOhcl2,
} from "./mockData.js";
import { resetRedis, addNewPrice } from "../main/service/redis.js";

describe("Socket", () => {
	let bitstamp,
		proxy,
		bitstamp2proxySocket,
		proxy2bitstampSocket,
		proxy2clientSocket,
		client2proxySocket,
		client2proxySocket2;

	beforeEach((done) => {
		resetRedis();

		const httpServer = createServer();
		httpServer.listen();
		bitstamp = new Server(httpServer);

		bitstamp.on("connection", (socket) => {
			bitstamp2proxySocket = socket;
		});
		bitstamp = buildDummyBitstamp(bitstamp);

		proxy2bitstampSocket = new Client(
			`ws://localhost:${httpServer.address().port}`
		);

		const httpServer2 = createServer();
		httpServer2.listen();
		proxy = new Server(httpServer2);
		proxy = buildClientSocket(proxy, proxy2bitstampSocket);
		proxy.on("connection", (socket) => {
			proxy2clientSocket = socket;
		});

		client2proxySocket = new Client(
			`http://localhost:${httpServer2.address().port}`
		);

		client2proxySocket2 = new Client(
			`http://localhost:${httpServer2.address().port}/streaming`
		);

		client2proxySocket2.on("connect", done);
	});

	afterEach(() => {
		bitstamp.close();
		proxy.close();
		proxy2bitstampSocket.close();
		client2proxySocket.close();
		client2proxySocket2.close();
	});

	it("socket between bitstamp and proxy", (done) => {
		proxy2bitstampSocket.on("hello", (arg) => {
			expect(arg).toBe("world");
			done();
		});
		bitstamp2proxySocket.emit("hello", "world");
	});

	it("socket between proxy and client", (done) => {
		client2proxySocket.on("hello", (arg) => {
			expect(arg).toBe("world");
			done();
		});
		proxy2clientSocket.emit("hello", "world");
	});

	it("subscribe", (done) => {
		client2proxySocket2.emit("subscribe", JSON.stringify(["btcusd"]));
		proxy2bitstampSocket.on("btcusd", (event) => broadcast(event));
		client2proxySocket2.on("btcusd", (arg) => {
			arg = JSON.parse(arg);
			expect(arg).toBe("subscribe btcusd successed");
			done();
		});
	});

	it("broadcast", (done) => {
		setExistSocketAndChannel(proxy2clientSocket, "btcusd");

		bitstamp2proxySocket.emit("btcusd", {
			data: JSON.stringify(btcusd),
		});

		proxy2bitstampSocket.on("btcusd", (event) => broadcast(event));

		client2proxySocket.on("btcusd", (arg) => {
			arg = JSON.parse(arg);
			expect(arg).toStrictEqual(expectedOhcl);
			done();
		});
	});

	it("OHCL", (done) => {
		history.forEach((data) =>
			addNewPrice(
				"btcusd",
				data.data.price,
				data.data.timestamp,
				process.env.OHCL_PRECISION_SEC
			)
		);

		setExistSocketAndChannel(proxy2clientSocket, "btcusd");

		bitstamp2proxySocket.emit("btcusd", {
			data: JSON.stringify(btcusd),
		});

		proxy2bitstampSocket.on("btcusd", (event) => broadcast(event));

		client2proxySocket.on("btcusd", (arg) => {
			arg = JSON.parse(arg);
			expect(arg).toStrictEqual(expectedOhcl2);
			done();
		});
	});
});
