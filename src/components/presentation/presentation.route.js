import express from "express";
import * as PresentationController from "./presentation.controller";
import collabRoute from "./collaboration/collaboration.route";
const presentationRoute = express.Router();
presentationRoute.use("/collab", collabRoute);
presentationRoute.get("/slide", PresentationController.getPresentationSlides);
presentationRoute.post("/slide", PresentationController.addSlide);
presentationRoute.post("/create", PresentationController.createPresentation);
presentationRoute.post("/delete", PresentationController.deletePresentation);
presentationRoute.get(
    "/detail/:presentationID",
    PresentationController.getPresentationDetail
);
presentationRoute.get("/", PresentationController.getMyPresentations);
export default presentationRoute;
