import express from "express";
import * as CommonController from "./common.controller";
import upload from "../../middleware/multer";
const commonRoute = express.Router();

commonRoute.post("/upload/image", upload.single("image"), CommonController.uploadImage);
export default commonRoute;
