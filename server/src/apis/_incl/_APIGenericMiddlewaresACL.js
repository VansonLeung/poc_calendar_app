import { UserAuthDao } from "../../dao/user/UserAuthDao.js";
import { UserACLDao } from "../../dao/user/UserACLDao.js";
import { _APIGenericAssociations } from "./_APIGenericAssociations.js";
import { Op } from 'sequelize';

export const _APIGenericMiddlewaresACL = {
    applyMiddlewareACL: ({
        models,
        apiName,
        requiredPermission,
    }) => {

        return async (req, res, next) => {
            try {
                const { accesstoken: accessToken } = req.headers;

                var roleCode = 'guest';

                console.log(req.headers)

                try {
                    const { session, user, userRole, } = await UserAuthDao.accessSession({ models, accessToken, });
                    roleCode = userRole?.code ?? 'guest';

                    req.session = session;
                    req.user = user;
                    req.userRole = userRole;
                    req.userRoleCode = roleCode;
        
                } catch (e) {
                    //
                    req.userRoleCode = roleCode;
                }

                const isAccessGranted = UserACLDao.deduceAccessGranted({
                    roleCode,
                    apiName,
                    requiredPermission,
                });

                if (!isAccessGranted) {
                    return res.status(403).json({ error: `Access denied: ${roleCode} -> ${apiName} -> ${requiredPermission}` });
                }

            } catch (error) {
                return res.status(500).json({ error: `Internal server error: ${error}` });
            }
    
            next();
        };
    },
}

