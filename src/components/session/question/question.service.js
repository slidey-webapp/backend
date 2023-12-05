import QuestionTable from "./question.model";

export const createQuestion = async ({ sessionID, content, participantID }) => {
    const newMessage = (
        await QuestionTable.create({
            sessionID,
            content,
            participantID,
        })
    ).get({
        plain: true,
    });
    return newMessage;
};

export const getQuestion = ({ sessionID, isAnswered }) => {
    return QuestionTable.findAll({
        raw: true,
        where: {
            sessionID,
            ...(isAnswered === false && { isAnswered: false }),
            ...(isAnswered === true && { isAnswered: true }),
        },
        order: [
            ["totalVoted", "DESC"],
            ["createdAt", "DESC"],
        ],
    });
};
