import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

/*
    Run server
*/

app.listen(process.env.SERVER_PORT, function () {
	console.log(`Node server is running on ${process.env.NODE_ENV} mode`);
});
