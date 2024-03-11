import fs from "fs";
import { API_STATUS, RESPONSE_CODE } from "../../config/contants";
import * as CommonService from "./common.service";
import { isValidFile } from "./common.util";
import * as MESSAGE from "../../resource/message";
import * as MediaAssetService from "./mediaAsset/mediaAsset.service";
import * as SlideService from "../presentation/slide/slide.service";
export const uploadImage = async (req, res, next) => {
    try {
        const user = req.user;
        const file = req.file;
        const valid = isValidFile(file);
        if (!valid.isValid) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.BAD_REQUEST,
                message: valid.message,
            });
        }
        const uploadResult = await CommonService.uploadFile(file);
        fs.unlink(file.path, (err) => {
            if (err) throw err;
        });
        const media = await MediaAssetService.createMediaAsset({
            mediaURL: uploadResult.mediaURL,
            publicID: uploadResult.publicID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: media,
            message: MESSAGE.POST_SUCCESS("Upload ảnh"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};

export const destroyUnuseAsset = async (req, res, next) => {
    try {
        const user = req.user;
        const allAssets = await MediaAssetService.getAllMedia();
        const slides = await Promise.all(
            allAssets.map((item) =>
                SlideService.findSlide({
                    mediaID: item.mediaID,
                })
            )
        );
        const deleteMedia = [];
        allAssets.forEach((item, index) => {
            if (!slides[index]) {
                deleteMedia.push(item);
            }
        });
        await Promise.all(deleteMedia.map((item) => CommonService.destroyFile(item.publicID)));
        await Promise.all(
            deleteMedia.map((item) =>
                MediaAssetService.deleteMediaAsset({
                    mediaID: item.mediaID,
                })
            )
        );
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: deleteMedia,
            message: MESSAGE.POST_SUCCESS("Xóa file thừa"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};
