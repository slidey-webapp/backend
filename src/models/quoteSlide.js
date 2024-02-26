import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class QuoteSlide extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "QuoteSlide",
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
                quote: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                author: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "QUOTE_SLIDE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "QUOTE_SLIDE_pkey",
                        unique: true,
                        fields: [{ name: "slideID" }],
                    },
                ],
            }
        );
    }
}
