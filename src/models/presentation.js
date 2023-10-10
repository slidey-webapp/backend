import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Presentation extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Presentation",
            {
                presentationID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "presentationID",
                },
                code: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                createdBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                currentSlideID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "SLIDE",
                        key: "slideID",
                    },
                    field: "currentSlideID",
                },
                updatedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
            },
            {
                tableName: "PRESENTATION",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "PRESENTATION_pkey",
                        unique: true,
                        fields: [{ name: "presentationID" }],
                    },
                ],
            }
        );
    }
}
