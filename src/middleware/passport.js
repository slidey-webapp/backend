import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { findAccountByToken } from "../components/account/account.service";
import { getToken } from "../utilities/request";
import { CUSTOMER_ACCESS_TOKEN_HEADER, JWT_KEY } from "../config/contants";
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWT_KEY;
opts.passReqToCallback = true;

const webHookOpts = {};
webHookOpts.jwtFromRequest = ExtractJwt.fromHeader(
    CUSTOMER_ACCESS_TOKEN_HEADER
);
webHookOpts.secretOrKey = JWT_KEY;
webHookOpts.passReqToCallback = true;

const normalStrategy = new Strategy(opts, function (
    request,
    jwt_payload,
    next
) {
    findAccountByToken(jwt_payload.accountID, getToken(request.headers))
        .then((user) => {
            if (user) {
                return next(null, user, {});
            } else {
                return next(null, false);
            }
        })
        .catch((error) => {
            return next(error, false);
        });
});

passport.use("normalStrategy", normalStrategy);

export default passport;
