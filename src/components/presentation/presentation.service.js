import { Op } from "../../database";
import { getInsensitiveCaseRegextForSearchLike } from "../../utilities/string";
import CollabTable from "./collaboration/collaboration.model";
import PresentationTable from "./presentation.model";

export const createPresentation = async ({ accountID, name, code, sessionID, isTemplate }) => {
    const newPresentation = (
        await PresentationTable.create({
            createdBy: accountID,
            name,
            code,
            sessionID,
            isTemplate: isTemplate || false,
        })
    ).get({
        plain: true,
    });
    return newPresentation;
};

export const findPresentation = (data, noSession = true, allowTemplate = false) => {
    if (!data) {
        return null;
    }
    return PresentationTable.findOne({
        raw: true,
        where: {
            ...(!allowTemplate && {
                isTemplate: {
                    [Op.not]: true,
                },
            }),
            ...data,
            ...(noSession && {
                sessionID: null,
            }),
        },
    });
};

export const getUserPresentation = ({ accountID, offset, limit, name }, noSession = true) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");

    return PresentationTable.findAll({
        raw: true,
        where: {
            [Op.or]: {
                createdBy: accountID,
                "$Collaborations.accountID$": accountID,
            },
            name: {
                [Op.regexp]: searchName,
            },
            isTemplate: {
                [Op.not]: true,
            },
            ...(noSession && {
                sessionID: null,
            }),
        },
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
        include: {
            model: CollabTable,
            attributes: [],
            as: "Collaborations",
            duplicating: false,
        },
    });
};

export const countPresentation = ({ accountID, name }, noSession = true) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    return PresentationTable.count({
        raw: true,
        where: {
            [Op.or]: {
                createdBy: accountID,
                "$Collaborations.accountID$": accountID,
            },
            name: {
                [Op.regexp]: searchName,
            },
            isTemplate: {
                [Op.not]: true,
            },
            ...(noSession && {
                sessionID: null,
            }),
        },
        include: {
            model: CollabTable,
            attributes: [],
            as: "Collaborations",
            duplicating: false,
        },
    });
};

export const getPresentationTemplate = ({ offset, limit, name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");

    return PresentationTable.findAll({
        raw: true,
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            isTemplate: true,
        },
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
    });
};

export const countPresentationTemplate = ({ name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    return PresentationTable.count({
        raw: true,
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            isTemplate: true,
        },
    });
};
export const updatePresentation = async ({ name, currentSlideID, updatedBy, presentationID }) => {
    const result = await PresentationTable.update(
        {
            ...(name && { name }),
            ...(currentSlideID && { currentSlideID }),
            ...(updatedBy && { updatedBy }),
        },
        {
            where: {
                presentationID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const deletePresentation = ({ presentationID }) => {
    return PresentationTable.destroy({
        where: {
            presentationID,
        },
    });
};

export const findAccessiblePresentation = (
    { accountID, presentationID, sessionID },
    noSession = true,
    allowTemplate = false
) => {
    return PresentationTable.findOne({
        raw: true,
        where: {
            [Op.or]: {
                createdBy: accountID,
                "$Collaborations.accountID$": accountID,
            },
            ...(!allowTemplate && {
                isTemplate: {
                    [Op.not]: true,
                },
            }),

            ...(presentationID && { presentationID }),
            ...(sessionID && { sessionID }),
            ...(noSession && {
                sessionID: null,
            }),
        },
        include: {
            model: CollabTable,
            attributes: [],
            as: "Collaborations",
            duplicating: false,
        },
    });
};
