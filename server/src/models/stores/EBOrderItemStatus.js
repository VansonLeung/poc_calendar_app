import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicSeqIdlessAttributes, 
    ContentAttributes, 
    DatedStatusAttributes,
} from "../_incl/index.js";

export const EBOrderItemStatus = {
    makeAssociations: ({Me, OrderItem}) => {
        Me.belongsTo(OrderItem, {
            foreignKey: 'orderItemId',
            as: 'orderItem',
            constraints: Settings.constraints,
        });
        OrderItem.hasMany(Me, {
            foreignKey: 'orderItemId',
            as: 'orderItemStatuses',
            constraints: Settings.constraints,
        });
    },

    makeSchema: () => {
        return {
            ...BasicSeqIdlessAttributes(),
            ...DatedStatusAttributes(),
            orderItemId: DataTypes.UUID,
            ...ContentAttributes(),
        }
    },
};

