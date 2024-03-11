import multer from "multer";
import path from "path";
import crypto from "crypto";
import { ENVIRONMENT } from "../config/contants";
const isProduction = process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;
const __dirname = path.resolve() + isProduction ? "dist" : "src";
const storage = multer.diskStorage({
    destination: __dirname + "/assets",
    filename: (req, file, cb) => {
        cb(
            null,
            crypto.createHash("md5").update(Math.random().toString()).digest("hex") + path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage: storage,
});

export default upload;
