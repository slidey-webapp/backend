import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class RoleClaim extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "RoleClaim",
            {
                roleClaimID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "roleClaimID",
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
                value: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "ROLE_CLAIM",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "ROLE_CLAIM_pkey",
                        unique: true,
                        fields: [{ name: "roleClaimID" }],
                    },
                ],
            }
        );
    }
}
