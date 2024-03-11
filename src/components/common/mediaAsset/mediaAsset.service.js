import MediaAssetTable from "./mediaAsset.model";

export const createMediaAsset = async ({ mediaURL, publicID }) => {
    const newAccount = (
        await MediaAssetTable.create({
            mediaURL,
            publicID,
        })
    ).get({
        plain: true,
    });
    return newAccount;
};

export const findMediaAsset = (data) => {
    return MediaAssetTable.findOne({
        raw: true,
        where: {
            ...data,
        },
    });
};

export const deleteMediaAsset = ({ publicID, mediaID, mediaURL }) => {
    return MediaAssetTable.destroy({
        where: {
            ...(publicID && { publicID }),
            ...(mediaID && { mediaID }),
            ...(mediaURL && { mediaURL }),
        },
    });
};

export const getAllMedia = () => {
    return MediaAssetTable.findAll({
        raw: true,
        limit: 1000,
        offset: 0,
    });
};
