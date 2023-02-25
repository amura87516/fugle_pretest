import WebSocket from "ws";
import { broadcast } from "./client.js";

export const subscribeBitstamp = (ws, currencyPair) => {
	ws.send(
		JSON.stringify({
			event: "bts:subscribe",
			data: {
				channel: `live_trades_${currencyPair}`,
			},
		})
	);
};

export const unsubscribeBitstamp = (ws, currencyPair) => {
	ws.send(
		JSON.stringify({
			event: "bts:unsubscribe",
			data: {
				channel: `live_trades_${currencyPair}`,
			},
		})
	);
};

export const buildBitstampSocket = (url) => {
	const ws = new WebSocket(url);

	ws.onopen = () => {
		console.log("open connection");
	};

	ws.onclose = () => {
		console.log("close connection");
	};

	ws.onmessage = (event) => broadcast(event);

	return ws;
};
