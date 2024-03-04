import express from "express";
import * as RoleController from "./role.controller";
const roleRoute = express.Router();

roleRoute.post("/create", RoleController.createNewRole);
roleRoute.post("/update", RoleController.updateRole);
roleRoute.get("/detail", RoleController.getRoleDetail);
roleRoute.post("/delete", RoleController.deleteRole);
roleRoute.post("/assign-role", RoleController.addRoleToAccount);
roleRoute.get("/", RoleController.getRoleList);

export default roleRoute;
