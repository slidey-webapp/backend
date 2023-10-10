import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class GroupMember extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "GroupMember",
            {
                groupMemberID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "groupMemberID",
                },
                groupID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "GROUP",
                        key: "groupID",
                    },
                    field: "groupID",
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
                role: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "GROUP_MEMBER",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "GROUP_MEMBER_pkey",
                        unique: true,
                        fields: [{ name: "groupMemberID" }],
                    },
                ],
            }
        );
    }
}
