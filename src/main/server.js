import app from "./app.js";
import dotenv from "dotenv";

import { Server } from "socket.io";
import http from "http";

import { buildBitstampSocket } from "./socket/bitstamp.js";
import { buildClientSocket } from "./socket/client.js";

/*
    Run server
*/

dotenv.config();

// build restful server
var server = http.createServer(app);
server.listen(process.env.SERVER_PORT);

// build socket server
server = new Server(server);
const ws = buildBitstampSocket(process.env.BITSTAMP_URL);
server = buildClientSocket(server, ws);
