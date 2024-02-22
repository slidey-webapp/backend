import * as MESSAGE from "../../resource/message";
import { JWT_KEY, SOCKET_AUTH_TIMEOUT, SOCKET_EVENT, SOCKET_PING_TIMEOUT } from "../../config/contants";
import * as SessionService from "../session/session.service";
import { getEditPresentationRoomName, getSessionRoomName } from "./socket.util";
import * as AccountService from "../account/account.service";
import * as PersonService from "../person/person.service";
import jwt from "jsonwebtoken";
import {
    emitEditPresentationJoin,
    emitEditPresentationLeave,
    emitEditPresentationPing,
    emitSessionParticipantJoin,
} from "./socket.eventEmitter";
import * as PresentationService from "../presentation/presentation.service";
import { mapUser } from "../../utilities/mapUser";
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

const onJoinEditPresentation = async (socket, payload) => {
    try {
        const { presentationID, accountID, token } = payload;
        const data = jwt.verify(token, JWT_KEY);
        if (!data) {
            socket.auth = false;
            return;
        }
        const [accountByToken, person, presentation] = await Promise.all([
            AccountService.findAccountByToken(accountID, token),
            PersonService.findPerson({
                accountID,
            }),
            PresentationService.findAccessiblePresentation({
                accountID,
                presentationID,
            }),
        ]);
        if (!presentation || !accountByToken || !person) {
            socket.auth = false;
            return;
        }
        socket.auth = true;
        if (!socket.joinPresentation) {
            socket.joinPresentation = [];
        }

        socket.join(getEditPresentationRoomName(presentationID));
        const user = mapUser({
            ...person,
            ...accountByToken,
        });
        let timeoutID = setTimeout(() => {
            console.log("Disconnecting due to un-ping:", socket.id);
            emitEditPresentationLeave({ presentationID, user });
            socket.disconnect();
        }, SOCKET_PING_TIMEOUT);

        emitEditPresentationJoin(
            {
                presentationID,
                user,
            },
            socket
        );

        socket.on(SOCKET_EVENT.PING_EDIT_PRESENTATION, (payload) => {
            clearTimeout(timeoutID);
            emitEditPresentationPing(
                {
                    presentationID,
                    user,
                },
                socket
            );
            timeoutID = setTimeout(() => {
                console.log("Disconnecting due to un-ping:", socket.id);
                emitEditPresentationLeave({ presentationID, user }, socket);
                socket.disconnect();
            }, SOCKET_PING_TIMEOUT);
        });

        socket.on(SOCKET_EVENT.LEAVE_EDIT_PRESENTATION, (payload) => {
            clearTimeout(timeoutID);
            console.log("Disconnecting due to manual leave:", socket.id);
            emitEditPresentationLeave({ presentationID, user });
            socket.disconnect();
        });
    } catch (error) {
        console.log("socket onJoinEditPresentation error:", error);
    }
};

export const onSocketConnection = (socket) => {
    console.log("connecting:", socket.id);
    socket.auth = false;

    socket.on(SOCKET_EVENT.HOST_JOIN_SESSION, (payload) => onHostJoinSession(socket, payload));
    socket.on(SOCKET_EVENT.JOIN_SESSION, (payload) => onJoinSession(socket, payload));
    socket.on(SOCKET_EVENT.JOIN_EDIT_PRESENTATION, (payload) => onJoinEditPresentation(socket, payload));
    setTimeout(() => {
        if (!socket.auth) {
            console.log("Disconnecting due to un-auth:", socket.id);
            socket.disconnect(MESSAGE);
        }
    }, SOCKET_AUTH_TIMEOUT);
};
