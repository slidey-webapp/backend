import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Role extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Role",
            {
                roleID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "roleID",
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                code: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                used: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                },
            },
            {
                tableName: "ROLE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "ROLE_pkey",
                        unique: true,
                        fields: [{ name: "roleID" }],
                    },
                ],
            }
        );
    }
}
