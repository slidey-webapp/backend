import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class QuestionVote extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "QuestionVote",
            {
                questionVoteID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "questionVoteID",
                },
                questionID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "QUESTION",
                        key: "questionID",
                    },
                    field: "questionID",
                },
                participantID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "SESSION_PARTICIPANT",
                        key: "participantID",
                    },
                    field: "participantID",
                },
            },
            {
                tableName: "QUESTION_VOTE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "QUESTION_VOTE_pkey",
                        unique: true,
                        fields: [{ name: "questionVoteID" }],
                    },
                ],
            }
        );
    }
}
