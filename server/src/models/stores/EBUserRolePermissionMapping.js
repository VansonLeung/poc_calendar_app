import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import {
    BasicAttributes,
    DatedStatusAttributes,
} from "../_incl/index.js";

export const EBUserRolePermissionMapping = {
    makeAssociations: ({Me, UserPermission, UserRole}) => {
        UserPermission.belongsToMany(UserRole, { 
            through: Me,
            as: 'userRoles',
            foreignKey: 'userPermissionId',
            constraints: Settings.constraints,
        });
        UserRole.belongsToMany(UserPermission, { 
            through: Me,
            as: 'userPermissions',
            foreignKey: 'userRoleId',
            constraints: Settings.constraints,
        });
    },

    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...DatedStatusAttributes(),
            permissionId: DataTypes.UUID,
            roleId: DataTypes.UUID,
        }
    },
}
