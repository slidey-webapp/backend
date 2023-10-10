import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class User extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "User",
            {
                accountID: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "accountID",
                },
                fullname: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "USER",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "USER_pkey",
                        unique: true,
                        fields: [{ name: "accountID" }],
                    },
                ],
            }
        );
    }
}
