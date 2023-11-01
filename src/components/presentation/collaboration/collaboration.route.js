import express from "express";
import * as CollabController from "./collaboration.controller";
const collabRoute = express.Router();

collabRoute.post("/create", CollabController.addCollab);
collabRoute.post("/delete", CollabController.removeCollab);
collabRoute.get("/", CollabController.getCollabs);
export default collabRoute;
