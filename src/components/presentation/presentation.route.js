import express from "express";
import * as PresentationController from "./presentation.controller";
const presentationRoute = express.Router();

presentationRoute.post("/slide", PresentationController.getPresentationSlides);
presentationRoute.post("/create", PresentationController.createPresentation);
presentationRoute.post("/delete", PresentationController.deletePresentation);
presentationRoute.get("/", PresentationController.getMyPresentations);
export default presentationRoute;
