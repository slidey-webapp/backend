import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class AccountRole extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "AccountRole",
            {
                accountRoleID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "accountRoleID",
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
                roleID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ROLE",
                        key: "roleID",
                    },
                    field: "roleID",
                },
            },
            {
                tableName: "ACCOUNT_ROLE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "ACCOUNT_ROLE_pkey",
                        unique: true,
                        fields: [{ name: "accountRoleID" }],
                    },
                ],
            }
        );
    }
}
