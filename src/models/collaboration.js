import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Collaboration extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Collaboration",
            {
                collaborationID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "collaborationID",
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
                accountID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ACCOUNT",
                        key: "accountID",
                    },
                    field: "accountID",
                },
            },
            {
                tableName: "COLLABORATION",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "COLLABORATION_pkey",
                        unique: true,
                        fields: [{ name: "collaborationID" }],
                    },
                ],
            }
        );
    }
}
