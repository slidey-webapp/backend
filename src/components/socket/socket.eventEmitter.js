import { socketServer } from "../../app";
import { SOCKET_EVENT } from "../../config/contants";
import { getEditPresentationRoomName, getSessionRoomName } from "./socket.util";

export const emitSessionMessage = ({ sessionID, message }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.MESSAGE, { message });
};

export const emitSessionQuestion = ({ sessionID, question }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.QUESTION, { question });
};

export const emitSessionUpvoteQuestion = ({ sessionID, question }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.UPVOTE_QUESTION, { question });
};

export const emitSessionAnswerQuestion = ({ sessionID, question }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.ANSWER_QUESTION, { question });
};

export const emitSessionChangeSlide = ({ sessionID, slide }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.CHANGE_SLIDE, { slide });
};

export const emitSessionEnd = ({ sessionID }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.END_SESSION, { sessionID });
};

export const emitSessionStartPresenting = ({ sessionID, slide }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.START_PRESENTING, { sessionID, slide });
};

export const emitSessionParticipantJoin = ({ sessionID, participant }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.JOIN_SESSION, { sessionID, participant });
};

export const emitSessionSubmitSlideResult = ({ sessionID, option }) => {
    socketServer.to(getSessionRoomName(sessionID)).emit(SOCKET_EVENT.SUBMIT_SLIDE_RESULT, { sessionID, option });
};

export const emitEditPresentationPing = ({ presentationID, user }, socket) => {
    if (socket) {
        socket.broadcast
            .to(getEditPresentationRoomName(presentationID))
            .emit(SOCKET_EVENT.PING_EDIT_PRESENTATION, { presentationID, user });
    } else {
        socketServer
            .to(getEditPresentationRoomName(presentationID))
            .emit(SOCKET_EVENT.PING_EDIT_PRESENTATION, { presentationID, user });
    }
};

export const emitEditPresentationJoin = ({ presentationID, user }, socket) => {
    if (socket) {
        socket.broadcast
            .to(getEditPresentationRoomName(presentationID))
            .emit(SOCKET_EVENT.JOIN_EDIT_PRESENTATION, { presentationID, user });
    } else {
        socketServer
            .to(getEditPresentationRoomName(presentationID))
            .emit(SOCKET_EVENT.JOIN_EDIT_PRESENTATION, { presentationID, user });
    }
};

export const emitEditPresentationLeave = ({ presentationID, user }, socket) => {
    if (socket) {
        socket.broadcast
            .to(getEditPresentationRoomName(presentationID))
            .emit(SOCKET_EVENT.LEAVE_EDIT_PRESENTATION, { presentationID, user });
    } else {
        socketServer
            .to(getEditPresentationRoomName(presentationID))
            .emit(SOCKET_EVENT.LEAVE_EDIT_PRESENTATION, { presentationID, user });
    }
};

export const emitUpdatePresentation = ({ presentation, user }) => {
    socketServer
        .to(getEditPresentationRoomName(presentation.presentationID))
        .emit(SOCKET_EVENT.UPDATE_PRESENTATION, { presentation, user });
};
