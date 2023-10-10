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
                presentationID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "PRESENTATION",
                        key: "presentationID",
                    },
                    field: "presentationID",
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
