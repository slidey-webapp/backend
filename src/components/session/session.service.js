import { Op } from "../../database";
import { getInsensitiveCaseRegextForSearchLike } from "../../utilities/string";
import CollabTable from "../presentation/collaboration/collaboration.model";
import PresentationTable from "../presentation/presentation.model";
import PresentSessionTable, { SESSION_STATUS, SessionParticipantTable } from "./session.model";

export const createSession = async ({ presentationID, accountID, name }) => {
    const newSession = (
        await PresentSessionTable.create({
            presentationID,
            accountID,
            status: SESSION_STATUS.STARTING,
            name,
        })
    ).get({
        plain: true,
    });
    return newSession;
};

export const findSession = (data) => {
    return PresentSessionTable.findOne({
        raw: true,
        where: {
            ...(data && data),
        },
    });
};

export const getUserPresentSession = ({ accountID, offset, limit, name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");

    return PresentSessionTable.findAll({
        raw: true,
        where: {
            [Op.or]: {
                "$Presentations.createdBy$": accountID,
                "$Presentations.Collaborations.accountID$": accountID,
            },
            name: {
                [Op.regexp]: searchName,
            },
        },
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
        include: {
            model: PresentationTable,
            attributes: [],
            as: "Presentations",
            duplicating: false,
            include: {
                model: CollabTable,
                attributes: [],
                as: "Collaborations",
                duplicating: false,
            },
        },
    });
};

export const countUserPresentSession = ({ accountID, name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");

    return PresentSessionTable.count({
        raw: true,
        where: {
            [Op.or]: {
                "$Presentations.createdBy$": accountID,
                "$Presentations.Collaborations.accountID$": accountID,
            },
            name: {
                [Op.regexp]: searchName,
            },
        },
        order: [["createdAt", "DESC"]],
        include: {
            model: PresentationTable,
            attributes: [],
            as: "Presentations",
            duplicating: false,
            include: {
                model: CollabTable,
                attributes: [],
                as: "Collaborations",
                duplicating: false,
            },
        },
    });
};

export const deleteSession = ({ sessionID }) => {
    return PresentSessionTable.destroy({
        where: {
            sessionID,
        },
    });
};

export const addParticipant = async ({ accountID, sessionID, name }) => {
    const newParticipant = (
        await SessionParticipantTable.create({
            accountID: accountID || null,
            sessionID,
            name: name || "",
        })
    ).get({
        plain: true,
    });
    return newParticipant;
};

export const findParticipant = async (data) => {
    return SessionParticipantTable.findOne({
        raw: true,
        where: {
            ...data,
        },
    });
};

export const getSessionParticipant = async ({ sessionID, offset, limit, name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    return SessionParticipantTable.findAll({
        raw: true,
        where: {
            sessionID,
            name: {
                [Op.regexp]: searchName,
            },
        },
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
    });
};

export const countSessionParticipant = async ({ sessionID, name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    return SessionParticipantTable.count({
        raw: true,
        where: {
            sessionID,
            name: {
                [Op.regexp]: searchName,
            },
        },
        order: [["createdAt", "DESC"]],
    });
};
