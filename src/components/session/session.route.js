import express from "express";
import * as SessionController from "./session.controller";
import { auth } from "../../middleware/auth";
import { getMe } from "../../middleware/getMe";
import { blockedCheck } from "../../middleware/blockedCheck";
const sessionRoute = express.Router();
sessionRoute.post("/init", auth, blockedCheck, SessionController.initSession);
sessionRoute.post("/start", auth, blockedCheck, SessionController.startPresentation);
sessionRoute.post("/join", getMe, SessionController.joinPresentation);
sessionRoute.post("/submit-answer", getMe, SessionController.submitAnswer);
sessionRoute.post("/end", auth, blockedCheck, SessionController.endSession);
sessionRoute.post("/update", auth, blockedCheck, SessionController.updateSession);
sessionRoute.post("/delete", auth, blockedCheck, SessionController.deleteSession);
sessionRoute.post("/message/send", getMe, SessionController.sendMessage);
sessionRoute.get("/message", getMe, SessionController.getMessageList);

sessionRoute.post("/question/send", getMe, SessionController.sendQuestion);
sessionRoute.post("/question/answered", auth, blockedCheck, SessionController.markAnsweredQuestion);
sessionRoute.post("/question/upvote", getMe, SessionController.upvoteQuestion);
sessionRoute.get("/question", getMe, SessionController.getQuestionlist);

sessionRoute.post("/slide/change-slide", auth, blockedCheck, SessionController.changeSlide);

sessionRoute.get("/detail/:sessionID", auth, blockedCheck, SessionController.getSessionDetail);
sessionRoute.get("/participant", auth, blockedCheck, SessionController.getSessionParticipant);

sessionRoute.get("/", auth, blockedCheck, SessionController.getMySession);
export default sessionRoute;
