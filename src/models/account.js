import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Account extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Account",
            {
                accountID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "accountID",
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                status: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "ACCOUNT",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "ACCOUNT_pkey",
                        unique: true,
                        fields: [{ name: "accountID" }],
                    },
                ],
            }
        );
    }
}
