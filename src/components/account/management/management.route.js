import express from "express";
import * as ManagementController from "./management.controller";
const accountManagementRoute = express.Router();

accountManagementRoute.get("/combo", ManagementController.getListAccountCombo);

export default accountManagementRoute;
