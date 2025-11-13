import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicAttributes,
    DatedSoftDeleteStatusAttributes,
    DatedStatusAttributes, 
} from "../_incl/index.js";

export const EBCustomerOrderMapping = {
    makeAssociations: ({Me, Customer, Order}) => {
        Customer.belongsToMany(Order, { 
            through: Me,
            as: 'orders',
            foreignKey: 'customerId',
            constraints: Settings.constraints,
        });
        Order.belongsToMany(Customer, { 
            through: Me,
            as: 'customers',
            foreignKey: 'orderId',
            constraints: Settings.constraints,
        });
    },

    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...DatedStatusAttributes(),
            ...DatedSoftDeleteStatusAttributes(),
            customerId: DataTypes.UUID,
            orderId: DataTypes.UUID,
        }
    },
}
