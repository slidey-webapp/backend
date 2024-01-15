import { SOCKET_SESSION_ROOM_PREFIX } from "../../config/contants";

export const getSessionRoomName = (sessionID, isHost = false) =>
    `${SOCKET_SESSION_ROOM_PREFIX}${sessionID}${isHost ? "host" : ""}`;
