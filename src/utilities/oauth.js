import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../config/contants";

export const validateGoogleToken = async (token) => {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        return { payload: ticket.getPayload() };
    } catch (error) {
        return { error: error };
    }
};
