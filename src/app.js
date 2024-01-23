import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import jwt from "jsonwebtoken";
import { myCors, passport } from "./middleware";
import { router } from "./route";
import { sequelize, testDBConnection } from "./database";
import SocketIO from "socket.io";

import * as SocketEventHandler from "./components/socket/socket.eventHandler";
import { SOCKET_EVENT } from "./config/contants";
dotenv.config();
const port = 5000;
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(myCors());
app.use(passport.initialize());

router(app);

const server = http.createServer(app);
const io = new SocketIO.Server(server, {
    transports: ["websocket"],
    cors: {
        origin: "*",
    },
    path: "/api/socket",
});

io.on(SOCKET_EVENT.CONNECTION, SocketEventHandler.onSocketConnection);

testDBConnection(sequelize).then(() => {
    server.listen(process.env.PORT || port, async () => {
        console.log(`App listening at http://localhost:${process.env.PORT || port}`);
    });
});

export const socketServer = io;
