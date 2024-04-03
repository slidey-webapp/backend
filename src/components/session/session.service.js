import { Op } from "../../database";
import { getInsensitiveCaseRegextForSearchLike } from "../../utilities/string";
import CollabTable from "../presentation/collaboration/collaboration.model";
import PresentationTable from "../presentation/presentation.model";
import PresentSessionTable, { SESSION_STATUS, SessionParticipantTable } from "./session.model";

export const createSession = async ({ presentationID, accountID, name, code, groupID }) => {
    const newSession = (
        await PresentSessionTable.create({
            presentationID,
            host: accountID,
            status: SESSION_STATUS.STARTING,
            code,
            name,
            groupID,
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

export const getUserPresentSession = ({ accountID, offset, limit, name, presentationID, groupID }) => {
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
            ...(presentationID && { presentationID }),
            ...(groupID && { groupID }),
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

export const countUserPresentSession = ({ accountID, name, presentationID, groupID }) => {
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
            ...(presentationID && { presentationID }),
            ...(groupID && { groupID }),
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

export const updateSession = async ({ sessionID, status, name }) => {
    const result = await PresentSessionTable.update(
        {
            ...(status && { status }),
            ...(name && { name }),
        },
        {
            where: {
                sessionID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const deleteSessionParticipant = ({ sessionID }) => {
    return SessionParticipantTable.destroy({
        where: {
            sessionID,
        },
    });
};

export const getSessionOfGroup = ({ offset, limit, name, presentationID, groupID }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");

    return PresentSessionTable.findAll({
        raw: true,
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            ...(presentationID && { presentationID }),
            ...(groupID && { groupID }),
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

export const countSessionOfGroup = ({ name, presentationID, groupID }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");

    return PresentSessionTable.count({
        raw: true,
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            ...(presentationID && { presentationID }),
            ...(groupID && { groupID }),
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
