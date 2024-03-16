import { SOCKET_EDIT_PRESENTATION_PREFIX, SOCKET_SESSION_ROOM_PREFIX } from "../../config/contants";

export const getSessionRoomName = (sessionID, isHost = false) =>
    `${SOCKET_SESSION_ROOM_PREFIX}${sessionID}${isHost ? "host" : ""}`;

export const getEditPresentationRoomName = (presentationID) => `${SOCKET_EDIT_PRESENTATION_PREFIX}${presentationID}`;

export const getUsersInEditPresentationRoom = async (io, presentationID, socketID) => {
    const sockets = await io.in(getEditPresentationRoomName(presentationID)).fetchSockets();
    const userInTheRoom = [];
    for (const item of sockets) {
        if (item.auth && item.user && (!socketID || socketID !== item.id)) {
            userInTheRoom.push(item.user);
        }
    }
    return userInTheRoom;
};
