import { Op } from "../../../database";
import { getInsensitiveCaseRegextForSearchLike } from "../../../utilities/string";
import AccountTable from "../../account/account.model";
import PersonTable from "../../person/person.model";
import CollabTable from "./collaboration.model";

export const addCollaborator = async ({ accountID, presentationID }) => {
    const newCollaborator = (
        await CollabTable.create({
            accountID,
            presentationID,
        })
    ).get({
        plain: true,
    });
    return newCollaborator;
};

export const getCollaborator = ({ presentationID, offset, limit, name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    return CollabTable.findAll({
        raw: true,
        offset,
        limit,
        where: {
            presentationID,
            "$Account.Person.fullname$": {
                [Op.regexp]: searchName,
            },
        },
        include: [
            {
                model: AccountTable,
                attributes: ["email"],
                as: "Account",
                duplicating: false,
                include: {
                    model: PersonTable,
                    attributes: ["fullname"],
                    as: "Person",
                    duplicating: false,
                },
            },
        ],
    });
};

export const countCollaborator = ({ presentationID, name }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    return CollabTable.count({
        raw: true,
        where: {
            presentationID,
            "$Account.Person.fullname$": {
                [Op.regexp]: searchName,
            },
        },
        include: [
            {
                model: AccountTable,
                attributes: ["email"],
                as: "Account",
                duplicating: false,
                include: {
                    model: PersonTable,
                    attributes: ["fullname"],
                    as: "Person",
                    duplicating: false,
                },
            },
        ],
    });
};

export const removeCollaborator = ({ presentationID, accountID }) => {
    return CollabTable.destroy({
        where: {
            presentationID,
            accountID,
        },
    });
};

export const findCollaborator = (data) => {
    return CollabTable.findOne({
        raw: true,
        where: {
            ...data,
        },
        include: [
            {
                model: AccountTable,
                attributes: ["email"],
                as: "Account",
                duplicating: false,
                include: {
                    model: PersonTable,
                    attributes: ["fullname"],
                    as: "Person",
                    duplicating: false,
                },
            },
        ],
    });
};
