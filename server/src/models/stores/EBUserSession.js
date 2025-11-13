import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicAttributes,
    DatedSoftDeleteStatusAttributes,
    DatedStatusAttributes,
} from "../_incl/index.js";

export const EBUserSession = {
    makeAssociations: ({Me, User, UserCredential}) => {
        User.hasMany(Me, {
            foreignKey: 'userId',
            as: 'sessions',
            constraints: Settings.constraints,
        });
        Me.belongsTo(User, {
            foreignKey: 'userId',
            as: 'user',
            constraints: Settings.constraints,
        });

        UserCredential.hasMany(Me, {
            foreignKey: 'userCredentialId',
            as: 'sessions',
            constraints: Settings.constraints,
        });
        Me.belongsTo(UserCredential, {
            foreignKey: 'userCredentialId',
            as: 'userCredential',
            constraints: Settings.constraints,
        });
    },

    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...DatedStatusAttributes(),
            ...DatedSoftDeleteStatusAttributes(),
            userId: DataTypes.UUID,
            userCredentialId: DataTypes.UUID,
            accessToken: {
                type: DataTypes.STRING(256),
                allowNull: false,
                unique: true,
            },
            refreshToken: {
                type: DataTypes.STRING(256),
                allowNull: false,
                unique: true,
            },    
        }
    },
};

