import accountRoute from "../components/account/account.route";
import commonRoute from "../components/common/common.route";
import groupRoute from "../components/group/group.route";
import presentationRoute from "../components/presentation/presentation.route";
import roleRoute from "../components/role/role.route";
import sessionRoute from "../components/session/session.route";
import visitHistoryRoute from "../components/visitHistory/visitHistory.route";
import { API_STATUS, RESPONSE_CODE } from "../config/contants";
import { auth } from "../middleware/auth";
import { blockedCheck } from "../middleware/blockedCheck";

export const router = (app) => {
    app.use("/api/account", accountRoute);
    app.use("/api/presentation", auth, blockedCheck, presentationRoute);
    app.use("/api/session", sessionRoute);
    app.use("/api/group", auth, blockedCheck, groupRoute);
    app.use("/api/visit-history", auth, blockedCheck, visitHistoryRoute);
    app.use("/api/role", auth, blockedCheck, roleRoute);
    app.use("/api/common", auth, blockedCheck, commonRoute);
    app.use("/api", async (req, res, next) => {
        try {
            res.status(RESPONSE_CODE.SUCCESS).json({
                status: API_STATUS.OK,
                message: "Hello",
            });
        } catch (error) {
            res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
                status: API_STATUS.INTERNAL_ERROR,
                message: error.message,
            });
        }
    });
};
