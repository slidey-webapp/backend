import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class HeadingSlide extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "HeadingSlide",
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
                subHeading: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "HEADING_SLIDE",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "HEADING_SLIDE_pkey",
                        unique: true,
                        fields: [{ name: "slideID" }],
                    },
                ],
            }
        );
    }
}
