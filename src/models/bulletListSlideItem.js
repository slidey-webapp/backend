import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class BulletListSlideItem extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "BulletListSlideItem",
            {
                bulletListSlideItemID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "bulletListSlideItemID",
                },
                slideID: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "BULLET_LIST_SLIDE",
                        key: "slideID",
                    },
                    field: "slideID",
                },
                value: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "BULLET_LIST_SLIDE_ITEM",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "BULLET_LIST_SLIDE_ITEM_pkey",
                        unique: true,
                        fields: [{ name: "bulletListSlideItemID" }],
                    },
                ],
            }
        );
    }
}
