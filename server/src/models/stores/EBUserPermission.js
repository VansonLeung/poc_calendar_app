import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicAttributes,
    DatedSoftDeleteStatusAttributes,
    DatedStatusAttributes,
} from "../_incl/index.js";

export const EBUserPermission = {
    makeAssociations: ({Me}) => {

    },
    
    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...DatedStatusAttributes(),
            ...DatedSoftDeleteStatusAttributes(),
            code: {
                type: DataTypes.STRING(64),
                allowNull: false,
                unique: true,
            },
        }
    },
}
