import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class MultipleChoiceSlide extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "MultipleChoiceSlide",
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
                chartType: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "MULTIPLE_CHOICE_SLIDE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "MULTIPLE_CHOICE_SLIDE_pkey",
                        unique: true,
                        fields: [{ name: "slideID" }],
                    },
                ],
            }
        );
    }
}
