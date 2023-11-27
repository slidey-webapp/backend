import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class SessionParticipant extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "SessionParticipant",
            {
                participantID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "participantID",
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
                accountID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: "accountID",
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "SESSION_PARTICIPANT",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "SESSION_PARTICIPANT_pkey",
                        unique: true,
                        fields: [{ name: "participantID" }],
                    },
                ],
            }
        );
    }
}
