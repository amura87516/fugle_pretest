import dotenv from "dotenv";
import axios from "axios";
import Ajv from "ajv";

dotenv.config();

const schema = {
	type: "array",
	items: {
		type: "number",
	},
};
const ajv = new Ajv();
const validator = ajv.compile(schema);

export const fetchHackerNews = () => {
	return axios.get(process.env.HACKER_NEWS_URL);
};

export const checHackerNewsData = (data) => validator(data);
