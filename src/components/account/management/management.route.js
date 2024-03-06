import express from "express";
import * as ManagementController from "./management.controller";
import { roleCheck } from "../../../middleware/roleCheck";
const accountManagementRoute = express.Router();
accountManagementRoute.get("/list", ManagementController.getListAccount);
accountManagementRoute.get("/combo", ManagementController.getListAccountCombo);
accountManagementRoute.post("/block", roleCheck, ManagementController.blockAccount);
accountManagementRoute.post("/unblock", roleCheck, ManagementController.unblockAccount);
export default accountManagementRoute;
