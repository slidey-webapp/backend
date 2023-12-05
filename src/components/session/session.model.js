import { models } from "../../database";
const PresentSessionTable = models.PresentSession;
export const SessionParticipantTable = models.SessionParticipant;
export default PresentSessionTable;

export const SESSION_STATUS = {
    STARTING: "STARTING",
    STARTED: "STARTED",
    ENDING: "ENDING",
    ENDED: "ENDED",
};
