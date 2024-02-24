import express from "express";
import * as VisitHistoryController from "./visitHistory.controller";
const visitHistoryRoute = express.Router();
visitHistoryRoute.get("/", VisitHistoryController.getMyHistory);
visitHistoryRoute.post("/visit", VisitHistoryController.visitAsset);

export default visitHistoryRoute;
