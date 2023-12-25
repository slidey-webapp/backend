import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Person extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "Person",
            {
                accountID: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: "ACCOUNT",
                        key: "accountID",
                    },
                    field: "accountID",
                },
                fullname: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "PERSON",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "PERSON_pkey",
                        unique: true,
                        fields: [{ name: "accountID" }],
                    },
                ],
            }
        );
    }
}
