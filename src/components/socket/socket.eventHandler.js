import * as MESSAGE from "../../resource/message";
import { JWT_KEY, SOCKET_AUTH_TIMEOUT, SOCKET_EVENT, SOCKET_SESSION_ROOM_PREFIX } from "../../config/contants";
import * as SessionService from "../session/session.service";
import { getSessionRoomName } from "./socket.util";
import * as AccountService from "../account/account.service";
import jwt from "jsonwebtoken";
import { emitSessionParticipantJoin } from "./socket.eventEmitter";

const onJoinSession = async (socket, payload) => {
    try {
        const { sessionID, participantID, token } = payload;
        const [session, participant] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),
            SessionService.findParticipant({
                participantID,
                sessionID: sessionID,
            }),
        ]);
        if (!session || !participant) {
            socket.auth = false;
            return;
        }
        if (session.groupID) {
            if (!token || !participant.accountID) {
                socket.auth = false;
                return;
            }
            const data = jwt.verify(token, JWT_KEY);
            if (!data) {
                socket.auth = false;
                return;
            }
            const accountByToken = await AccountService.findAccountByToken(participant.accountID, token);
            if (!accountByToken) {
                socket.auth = false;
                return;
            }
        }
        socket.auth = true;
        socket.join(getSessionRoomName(sessionID));
        emitSessionParticipantJoin({ sessionID, participant });
        socket.emit(SOCKET_EVENT.JOIN_SESSION, { sessionID, participantID });
    } catch (error) {
        console.log("socket host join error:", error);
        socket.auth = false;
    }
};

const onHostJoinSession = async (socket, payload) => {
    try {
        const { sessionID, accountID, token } = payload;
        const session = await SessionService.findSession({
            sessionID,
            host: accountID,
        });

        if (!session) {
            socket.auth = false;
            return;
        }

        const data = jwt.verify(token, JWT_KEY);
        if (!data) {
            socket.auth = false;
            return;
        }
        const accountByToken = await AccountService.findAccountByToken(accountID, token);
        if (!accountByToken) {
            socket.auth = false;
            return;
        }
        socket.auth = true;
        socket.isHost = true;
        socket.join(getSessionRoomName(sessionID));
        socket.join(getSessionRoomName(sessionID, true));
        socket.emit(SOCKET_EVENT.HOST_JOIN_SESSION, { sessionID });
    } catch (error) {
        console.log("socket join error:", error);
        socket.auth = false;
    }
};

export const onSocketConnection = (socket) => {
    console.log("connecting:", socket.id);
    socket.auth = false;

    socket.on(SOCKET_EVENT.HOST_JOIN_SESSION, (payload) => onHostJoinSession(socket, payload));
    socket.on(SOCKET_EVENT.JOIN_SESSION, async (payload) => onJoinSession(socket, payload));

    setTimeout(() => {
        if (!socket.auth) {
            console.log("Disconnecting due to un-auth:", socket.id);
            socket.disconnect(MESSAGE);
        }
    }, SOCKET_AUTH_TIMEOUT);
};
