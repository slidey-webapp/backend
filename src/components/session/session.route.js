import express from "express";
import * as SessionController from "./session.controller";
import { auth } from "../../middleware/auth";
import { getMe } from "../../middleware/getMe";
const sessionRoute = express.Router();
sessionRoute.post("/init", auth, SessionController.initSession);
sessionRoute.post("/start", auth, SessionController.startPresentation);
sessionRoute.post("/join", getMe, SessionController.joinPresentation);
sessionRoute.post("/submit-answer", getMe, SessionController.submitAnswer);
sessionRoute.post("/end", auth, SessionController.endSession);
sessionRoute.post("/update", auth, SessionController.updateSession);
sessionRoute.post("/delete", auth, SessionController.deleteSession);
sessionRoute.post("/message/send", getMe, SessionController.sendMessage);
sessionRoute.get("/message", getMe, SessionController.getMessageList);

sessionRoute.post("/question/send", getMe, SessionController.sendQuestion);
sessionRoute.post("/question/answered", auth, SessionController.markAnsweredQuestion);
sessionRoute.post("/question/upvote", getMe, SessionController.upvoteQuestion);
sessionRoute.get("/question", getMe, SessionController.getQuestionlist);

sessionRoute.post("/slide/change-slide", auth, SessionController.changeSlide);

sessionRoute.get("/detail/:sessionID", auth, SessionController.getSessionDetail);
sessionRoute.get("/participant", auth, SessionController.getSessionParticipant);

sessionRoute.get("/", auth, SessionController.getMySession);
export default sessionRoute;
