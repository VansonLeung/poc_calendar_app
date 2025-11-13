
export const UserACLDao = {
    deduceAccessGranted: ({
        roleCode = 'guest',
        apiName,
        requiredPermission,
    }) => {
        const aclRoles = aclConfig[apiName]?.[requiredPermission];
        
        if (!aclRoles) {
            // no rules
            return true;
        }

        if (aclRoles.has(roleCode)) {
            return true;
        }

        return false;
    },
};

const aclConfig = {
    Product: {
        create: new Set(['admin']),
        read: new Set(['admin', 'user', 'guest']),
        update: new Set(['admin']),
        delete: new Set(['admin']),
    },
    Order: {
        create: new Set(['user']),
        read: new Set(['admin', 'user']),
        update: new Set(['admin']),
        delete: new Set(['admin']),
    },
    Shop: {
        create: new Set(['admin']),
        read: new Set(['admin', 'user', 'guest']),
        update: new Set(['admin']),
        delete: new Set(['admin']),
    },
    User: {
        create: new Set(['admin']),
        read: new Set(['admin']),
        update: new Set(['admin']),
        delete: new Set(['admin']),
    },
    auth: {
        logout: new Set(['admin', 'user',]),
    },
};


