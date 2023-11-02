import express from "express";
import * as CollabController from "./collaboration.controller";
const collabRoute = express.Router();

collabRoute.post("/join", CollabController.joinCollab);
collabRoute.post("/send-invitation", CollabController.sendInviteEmail);
collabRoute.post("/delete", CollabController.removeCollab);
collabRoute.get("/", CollabController.getCollabs);
export default collabRoute;
