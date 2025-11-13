import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicAttributes,
    DatedSoftDeleteStatusAttributes,
    DatedStatusAttributes,
    OrderAttributes,
} from "../_incl/index.js";

export const EBOrder = {
    makeAssociations: ({Me, }) => {

    },

    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...DatedStatusAttributes(),
            ...DatedSoftDeleteStatusAttributes(),
            ...OrderAttributes(),
            customerId: DataTypes.UUID,
        }
    },
};

