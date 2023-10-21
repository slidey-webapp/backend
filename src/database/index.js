import Sequelize from "sequelize";
import dotenv from "dotenv";
import SequelizeAuto from "sequelize-auto";
import initModels from "../models/init-models";
dotenv.config();

export const sequelize = new Sequelize(process.env.DB_URI, {
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
    database: process.env.DB_DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
});

export const testDBConnection = async (sequelize) => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");

        /*======= do not delete this =======*/
        // eslint-disable-next-line no-constant-condition
        if (true) {
            const options = {
                caseFile: "c",
                caseModel: "p",
                caseProp: "c",
                directory: "./src/models",
                additional: {
                    timestamps: true,
                    paranoid: true,
                },
                lang: "esm",
                useDefine: true,
                noAlias: true,
            };
            const auto = new SequelizeAuto(sequelize, null, null, options);
            auto.run();
        }
        /*=====================================================*/
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

export const Op = Sequelize.Op;

export const models = initModels(sequelize);
