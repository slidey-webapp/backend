import { Sequelize } from "sequelize";
import QuestionTable, { QuestionVoteTable } from "./question.model";

export const createQuestion = async ({ sessionID, content, participantID }) => {
    const newQuestion = (
        await QuestionTable.create({
            sessionID,
            content,
            participantID,
        })
    ).get({
        plain: true,
    });
    return newQuestion;
};

export const getQuestion = ({ sessionID, isAnswered, offset, limit }) => {
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
        offset,
        limit,
    });
};

export const countQuestion = ({ sessionID, isAnswered }) => {
    return QuestionTable.count({
        where: {
            sessionID,
            ...(isAnswered === false && { isAnswered: false }),
            ...(isAnswered === true && { isAnswered: true }),
        },
    });
};

export const findQuestion = (data) => {
    return QuestionTable.findOne({
        raw: true,
        where: {
            ...(data && data),
        },
    });
};

export const createQuestionUpvote = async ({ questionID, participantID }) => {
    const newQuestionUpvote = (
        await QuestionVoteTable.create({
            questionID,
            participantID,
        })
    ).get({
        plain: true,
    });
    return newQuestionUpvote;
};

export const upvoteQuestion = async ({ questionID, totalVoted }) => {
    const result = await QuestionTable.update(
        {
            totalVoted,
        },
        {
            where: {
                questionID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const markAnsweredQuestion = async ({ questionID }) => {
    const result = await QuestionTable.update(
        {
            isAnswered: true,
        },
        {
            where: {
                questionID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const getQuestionUpvote = async ({ questionID }) => {
    return QuestionVoteTable.findAll({
        raw: true,
        where: {
            questionID,
        },
        order: [["createdAt", "DESC"]],
    });
};
