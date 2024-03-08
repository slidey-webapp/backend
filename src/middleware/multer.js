import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
    destination: "./assets",
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
