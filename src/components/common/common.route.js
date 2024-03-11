import express from "express";
import * as CommonController from "./common.controller";
import upload from "../../middleware/multer";
import { roleCheck } from "../../middleware/roleCheck";
const commonRoute = express.Router();

commonRoute.post("/upload/image", upload.single("image"), CommonController.uploadImage);
commonRoute.post("/destroy-unuse", roleCheck, CommonController.destroyUnuseAsset);

export default commonRoute;
