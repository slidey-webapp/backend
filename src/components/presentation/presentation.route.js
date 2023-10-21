import express from "express";
import * as PresentationController from "./presentation.controller";
const presentationRoute = express.Router();

presentationRoute.post("/create", PresentationController.createPresentation);
presentationRoute.get("/", PresentationController.getMyPresentations);
export default presentationRoute;
