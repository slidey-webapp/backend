import * as QuestionService from "./question.service";

export const mapQuestion = (question) => {
    return question;
};

export const deleteQuestionReference = ({ questionID }) => {
    return QuestionService.deleteQuestionVote({ questionID });
};
