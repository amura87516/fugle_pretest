import express from "express";
import { fetchHackerNews, checHackerNewsData } from "../service/hackerNews.js";
import { rateLimiterMiddleware } from "../middleware/rateLimitor.js";

/*
	Controllers.
	Check if input params are valid then call service function
*/

var router = express.Router();

router.get("/", rateLimiterMiddleware, function (req, res) {
	const { user: userId } = req.query;

	// check heroId is valid
	if (isNaN(+userId) || +userId <= 0 || +userId > 1000) {
		res.status(400).send("invalid user id");
		return;
	}

	fetchHackerNews()
		.then((result) => {
			if (!checHackerNewsData(result.data)) {
				res.status(500).json(
					"Got unexpected data from upstream server"
				);
				return;
			}
			res.json({
				result: result.data,
			});
		})
		.catch((err) => {
			res.status(500).json(err.data);
		});
});

export const dataRouter = router;
