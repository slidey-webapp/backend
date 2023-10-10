import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class SlideResult extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "SlideResult",
            {
                slideResultID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "slideResultID",
                },
                slideID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "SLIDE",
                        key: "slideID",
                    },
                    field: "slideID",
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
                value: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "SLIDE_RESULT",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "SLIDE_RESULT_pkey",
                        unique: true,
                        fields: [{ name: "slideResultID" }],
                    },
                ],
            }
        );
    }
}
