import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class WordCloudSlide extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "WordCloudSlide",
            {
                slideID: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: "SLIDE",
                        key: "slideID",
                    },
                    field: "slideID",
                },
                question: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "WORD_CLOUD_SLIDE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "WORD_CLOUD_SLIDE_pkey",
                        unique: true,
                        fields: [{ name: "slideID" }],
                    },
                ],
            }
        );
    }
}
