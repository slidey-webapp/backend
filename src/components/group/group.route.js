import express from "express";
import * as GroupController from "./group.controller";
const groupRoute = express.Router();

groupRoute.post("/create", GroupController.createGroup);
groupRoute.post("/send-invitation", GroupController.sendInviteEmail);
groupRoute.post("/join", GroupController.joinGroup);
groupRoute.post("/member/remove", GroupController.removeGroupMember);
groupRoute.post("/member/update-role", GroupController.updateGroupMemberRole);
groupRoute.post("/leave", GroupController.leaveGroup);
groupRoute.post("/delete", GroupController.deleteGroup);
groupRoute.post("/update/:id", GroupController.updateGroup);

groupRoute.get("/detail", GroupController.getGroupDetail);
groupRoute.get("/members", GroupController.getGroupMember);
groupRoute.get("/combo", GroupController.getListGroupCombo);
groupRoute.get("/", GroupController.getListGroup);

export default groupRoute;
