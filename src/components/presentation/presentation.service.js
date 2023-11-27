import { Op } from "../../database";
import { getInsensitiveCaseRegextForSearchLike } from "../../utilities/string";
import CollabTable from "./collaboration/collaboration.model";
import PresentationTable from "./presentation.model";

export const createPresentation = async ({ accountID, name, code }) => {
    const newPresentation = (
        await PresentationTable.create({
            createdBy: accountID,
            name,
            code,
        })
    ).get({
        plain: true,
    });
    return newPresentation;
};

export const findPresentation = (data, noSession = true) => {
    if (!data) {
        return null;
    }
    return PresentationTable.findOne({
        raw: true,
        where: {
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

export const countPresentation = ({ accountID, name }) => {
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
        },
        include: {
            model: CollabTable,
            attributes: [],
            as: "Collaborations",
            duplicating: false,
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

export const findAccessiblePresentation = ({ accountID, presentationID }, noSession = true) => {
    return PresentationTable.findOne({
        raw: true,
        where: {
            [Op.or]: {
                createdBy: accountID,
                "$Collaborations.accountID$": accountID,
            },
            presentationID,
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
