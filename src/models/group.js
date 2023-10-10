import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Group extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Group",
            {
                groupID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "groupID",
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                code: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                createdBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ACCOUNT",
                        key: "accountID",
                    },
                },
                sharedPresentationID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "PRESENTATION",
                        key: "presentationID",
                    },
                    field: "sharedPresentationID",
                },
            },
            {
                tableName: "GROUP",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "GROUP_pkey",
                        unique: true,
                        fields: [{ name: "groupID" }],
                    },
                ],
            }
        );
    }
}
