import { Op } from "../../../database";
import { SessionParticipantTable } from "../session.model";
import MessageTable from "./message.mode";

export const createMessage = async ({ sessionID, content, participantID }) => {
    const newMessage = (
        await MessageTable.create({
            sessionID,
            content,
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
            ...(lastMessageID && {
                messageID: {
                    [Op.lt]: lastMessageID,
                },
            }),
        },
        limit,
        order: [["messageID", "DESC"]],
        include: {
            model: SessionParticipantTable,
            as: "SessionParticipant",
            duplicating: false,
        },
    });
};

export const deleteMessageOfSession = async ({ sessionID }) => {
    return MessageTable.destroy({
        where: {
            sessionID,
        },
    });
};
