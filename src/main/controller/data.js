import express from "express";
import { fetchHackerNews, checHackerNewsData } from "../service/hackerNews.js";

/*
	Controllers.
	Check if input params are valid then call service function
*/

var router = express.Router();

router.get("/", function (req, res) {
	const { user: userId } = req.query;
	// check heroId is numeric and positive
	if (isNaN(+userId) || +userId <= 0 || +userId > 1000) {
		res.status(400).send("invalid user id");
		return;
	}

	fetchHackerNews()
		.then((result) => {
			if (!checHackerNewsData(result.data)) {
				res.status(502);
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
