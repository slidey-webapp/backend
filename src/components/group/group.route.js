import express from "express";
import * as GroupController from "./group.controller";
const groupRoute = express.Router();

groupRoute.post("/create", GroupController.createGroup);
groupRoute.get("/", GroupController.getListGroup);
export default groupRoute;
