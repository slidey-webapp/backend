import { Op } from "../../../database";
import MessageTable from "./message.mode";

export const createMessage = async ({ sessionID, message, participantID }) => {
    const newMessage = (
        await MessageTable.create({
            sessionID,
            message,
            participantID,
        })
    ).get({
        plain: true,
    });
    return newMessage;
};

export const getMessageList = ({ sessionID, lastMessageID, limit }) => {
    return MessageTable.findAll({
        raw: true,
        where: {
            sessionID,
            messageID: {
                [Op.lt]: lastMessageID,
            },
        },
        limit,
        order: [["messageID", "DESC"]],
    });
};
