import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Question extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Question",
            {
                questionID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "questionID",
                },
                content: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                isAnswered: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                    defaultValue: false,
                },
                totalVoted: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    defaultValue: 0,
                },
                sessionID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "PRESENT_SESSION",
                        key: "sessionID",
                    },
                    field: "sessionID",
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
                tableName: "QUESTION",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "QUESTION_pkey",
                        unique: true,
                        fields: [{ name: "questionID" }],
                    },
                ],
            }
        );
    }
}
