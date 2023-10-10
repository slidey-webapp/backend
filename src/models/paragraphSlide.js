import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class ParagraphSlide extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "ParagraphSlide",
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
                heading: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                paragraph: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "PARAGRAPH_SLIDE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "PARAGRAPH_SLIDE_pkey",
                        unique: true,
                        fields: [{ name: "slideID" }],
                    },
                ],
            }
        );
    }
}
