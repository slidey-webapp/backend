import { SOCKET_EDIT_PRESENTATION_PREFIX, SOCKET_SESSION_ROOM_PREFIX } from "../../config/contants";

export const getSessionRoomName = (sessionID, isHost = false) =>
    `${SOCKET_SESSION_ROOM_PREFIX}${sessionID}${isHost ? "host" : ""}`;

export const getEditPresentationRoomName = (presentationID) => `${SOCKET_EDIT_PRESENTATION_PREFIX}${presentationID}`;
