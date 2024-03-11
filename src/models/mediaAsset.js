import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class MediaAsset extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "MediaAsset",
            {
                mediaID: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: "mediaID",
                },
                mediaURL: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    field: "mediaURL",
                },
                publicID: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    field: "publicID",
                },
            },
            {
                tableName: "MEDIA_ASSET",
                schema: "public",
                timestamps: true,
                paranoid: true,
                indexes: [
                    {
                        name: "MEDIA_ASSET_pkey",
                        unique: true,
                        fields: [{ name: "mediaID" }],
                    },
                ],
            }
        );
    }
}
