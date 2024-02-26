import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class WordCloudSlideOption extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "WordCloudSlideOption",
            {
                wordCloudSlideOptionID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "wordCloudSlideOptionID",
                },
                slideID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "WORD_CLOUD_SLIDE",
                        key: "slideID",
                    },
                    field: "slideID",
                },
                option: {
                    type: DataTypes.STRING,
                    allowNull: true,
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
                tableName: "WORD_CLOUD_SLIDE_OPTION",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "WORD_CLOUD_SLIDE_OPTION_pkey",
                        unique: true,
                        fields: [{ name: "wordCloudSlideOptionID" }],
                    },
                ],
            }
        );
    }
}
