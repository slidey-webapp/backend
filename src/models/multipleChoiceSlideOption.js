import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class MultipleChoiceSlideOption extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "MultipleChoiceSlideOption",
            {
                slideID: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "MULTIPLE_CHOICE_SLIDE",
                        key: "slideID",
                    },
                    field: "slideID",
                },
                option: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                optionID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "optionID",
                },
            },
            {
                tableName: "MULTIPLE_CHOICE_SLIDE_OPTION",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "MULTIPLE_CHOICE_SLIDE_OPTION_pkey",
                        unique: true,
                        fields: [{ name: "optionID" }],
                    },
                ],
            }
        );
    }
}
