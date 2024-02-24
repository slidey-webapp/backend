import VisitHistoryTable from "./visitHistory.model";

export const getAccountHistory = ({ accountID, offset, limit }) => {
    return VisitHistoryTable.findAll({
        where: {
            accountID,
        },
        raw: true,
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: limit,
    });
};

export const countAccountHistory = ({ accountID }) => {
    return VisitHistoryTable.count({
        where: {
            accountID,
        },
    });
};

export const createHistory = async ({ accountID, assetID, assetType }) => {
    const a = await VisitHistoryTable.create({ accountID, assetID, assetType });
    const result = a.get({
        plain: true,
    });
    return result;
};

export const updateHistory = async ({ accountID, assetID, assetType }) => {
    const result = await VisitHistoryTable.update(
        {
            assetType: assetType,
        },
        {
            where: {
                accountID,
                assetID,
                assetType,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const findHistory = ({ accountID, assetID, assetType }) => {
    return VisitHistoryTable.findOne({
        where: {
            accountID,
            assetID,
            assetType,
        },
        raw: true,
    });
};
