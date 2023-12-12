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
                content: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                sessionID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "PRESENT_SESSION",
                        key: "sessionID",
                    },
                    field: "sessionID",
                },
                participantID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "SESSION_PARTICIPANT",
                        key: "participantID",
                    },
                    field: "participantID",
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
