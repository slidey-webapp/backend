import express from "express";
import * as AccountController from "./account.controller";
import { auth } from "../../middleware/auth";
const accountRoute = express.Router();

accountRoute.post("/sign-up", AccountController.signUp);
accountRoute.post("/login", AccountController.login);
accountRoute.post("/verify", AccountController.verifyEmail);
accountRoute.get("/auth", AccountController.checkAuth);

accountRoute.post("/google-login", AccountController.googleLogin);
accountRoute.post("/google-sign-up", AccountController.googleSignup);
accountRoute.post("/change-password", auth, AccountController.changePassword);
export default accountRoute;
