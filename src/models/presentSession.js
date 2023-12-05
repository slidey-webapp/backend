import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class PresentSession extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "PresentSession",
            {
                sessionID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "sessionID",
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
                status: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                host: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "PRESENT_SESSION",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "PRESENT_SESSION_pkey",
                        unique: true,
                        fields: [{ name: "sessionID" }],
                    },
                ],
            }
        );
    }
}
