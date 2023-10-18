import accountRoute from "../components/account/account.route";
import { API_STATUS, RESPONSE_CODE } from "../config/contants";

export const router = (app) => {
    app.use("/account", accountRoute);
    app.use("/", async (req, res, next) => {
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
