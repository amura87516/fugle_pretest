import nock from "nock";
import { URL } from "url";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

// test data for hacker news restful api

const url = new URL(process.env.HACKER_NEWS_URL);
export const HACKER_NEWS_API = nock(`${url.protocol}//${url.hostname}`)
	.get(url.pathname)
	.query(url.searchParams);

// build testing server

export const buildSimpleSocketServer = () => {
	const httpServer = createServer();
	httpServer.listen();
	const socketServer = new Server(httpServer);
	return [socketServer, httpServer.address().port];
};

export const buildDummyUpstreamServer = (upstreamServer) => {
	upstreamServer.on("connection", (socket) => {
		socket.on("message", (data) => {
			data = JSON.parse(data);
			const currencyPair = data.data.channel.split("_")[2];
			if (data.event == "bts:subscribe") {
				socket.emit(currencyPair, {
					data: JSON.stringify({
						event: "bts:subscription_succeeded",
						data: {},
						channel: `live_trades_${currencyPair}`,
					}),
				});
			}
		});
	});

	return upstreamServer;
};
