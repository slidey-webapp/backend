import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Message extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Message",
            {
                messageID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "messageID",
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
                content: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                createdBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ACCOUNT",
                        key: "accountID",
                    },
                },
            },
            {
                tableName: "MESSAGE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "MESSAGE_pkey",
                        unique: true,
                        fields: [{ name: "messageID" }],
                    },
                ],
            }
        );
    }
}
