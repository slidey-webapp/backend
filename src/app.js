import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import jwt from "jsonwebtoken";
import { myCors, passport } from "./middleware";
import { router } from "./route";
import { sequelize, testDBConnection } from "./database";
dotenv.config();
const port = 3030;
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(myCors());
app.use(passport.initialize());

router(app);

testDBConnection(sequelize).then(() => {
    app.listen(process.env.PORT || port, async () => {
        console.log(
            `App listening at http://localhost:${process.env.PORT || port}`
        );
    });
});
