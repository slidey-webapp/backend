import accountRoute from "../components/account/account.route";
import presentationRoute from "../components/presentation/presentation.route";
import { API_STATUS, RESPONSE_CODE } from "../config/contants";
import { auth } from "../middleware/auth";

export const router = (app) => {
    app.use("/api/account", accountRoute);
    app.use("/api/presentation", auth, presentationRoute);
    app.use("/api", async (req, res, next) => {
        try {
            res.status(RESPONSE_CODE.SUCCESS).json({
                status: API_STATUS.OK,
                message: "Hello",
                data: process.env.CURRENT_ENV,
            });
        } catch (error) {
            res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
                status: API_STATUS.INTERNAL_ERROR,
                message: error.message,
            });
        }
    });
};
