import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class AccountToken extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "AccountToken",
            {
                accountID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ACCOUNT",
                        key: "accountID",
                    },
                    field: "accountID",
                },
                tokenID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "tokenID",
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                token: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "ACCOUNT_TOKEN",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "ACCOUNT_TOKEN_pkey",
                        unique: true,
                        fields: [{ name: "tokenID" }],
                    },
                ],
            }
        );
    }
}
