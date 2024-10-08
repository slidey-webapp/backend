import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Slide extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Slide",
            {
                slideID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "slideID",
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
                slideOrder: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                horizontalAlignment: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                verticalAlignment: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                textSize: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                textColor: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                textBackground: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                layout: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                mediaID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "MEDIA_ASSET",
                        key: "mediaID",
                    },
                    field: "mediaID",
                },
            },
            {
                tableName: "SLIDE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "SLIDE_pkey",
                        unique: true,
                        fields: [{ name: "slideID" }],
                    },
                ],
            }
        );
    }
}
