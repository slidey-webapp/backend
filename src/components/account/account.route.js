import express from "express";
import * as AccountController from "./account.controller";
import { auth } from "../../middleware/auth";
import accountManagementRoute from "./management/management.route";
const accountRoute = express.Router();
accountRoute.use("/management", auth, accountManagementRoute);

accountRoute.post("/sign-up", AccountController.signUp);
accountRoute.post("/login", AccountController.login);
accountRoute.post("/verify", AccountController.verifyEmail);
accountRoute.get("/auth", auth, AccountController.authToken);
accountRoute.post("/logout", auth, AccountController.logout);

accountRoute.post("/google-login", AccountController.googleLogin);

accountRoute.post("/change-password", auth, AccountController.changePassword);
accountRoute.post("/forgot-password", AccountController.forgotPassword);
accountRoute.post("/reset-password", AccountController.resetPassword);
accountRoute.post("/create-password", auth, AccountController.createPassword);
export default accountRoute;
