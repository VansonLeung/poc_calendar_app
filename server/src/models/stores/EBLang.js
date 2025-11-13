import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicAttributes, 
    CodeAttributes, 
    DatedSoftDeleteStatusAttributes, 
    DatedStatusAttributes,
} from "../_incl/index.js";

export const EBLang = {
    makeAssociations: ({Me}) => {

    },

    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...CodeAttributes(),
            ...DatedStatusAttributes(),
            ...DatedSoftDeleteStatusAttributes(),
        }
    },
};

