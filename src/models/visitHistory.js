import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class VisitHistory extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "VisitHistory",
            {
                visitHistoryID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "visitHistoryID",
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
                assetType: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                assetID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: "assetID",
                },
            },
            {
                tableName: "VISIT_HISTORY",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "VISIT_HISTORY_pkey",
                        unique: true,
                        fields: [{ name: "visitHistoryID" }],
                    },
                ],
            }
        );
    }
}
