import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class BulletListSlide extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "BulletListSlide",
            {
                slideID: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: "SLIDE",
                        key: "slideID",
                    },
                    field: "slideID",
                },
                heading: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "BULLET_LIST_SLIDE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "BULLET_LIST_SLIDE_pkey",
                        unique: true,
                        fields: [{ name: "slideID" }],
                    },
                ],
            }
        );
    }
}
