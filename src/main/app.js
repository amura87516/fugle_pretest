import express from "express";
import { dataRouter } from "./controller/data.js";

/*
    Build server
*/

var app = express();

app.use("/data", dataRouter);

export default app;
