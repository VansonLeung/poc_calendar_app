import Sequelize, { DataTypes } from "sequelize";
import { defaultValueSchemable } from "sequelize/lib/utils";

export const OrderItemAttributes = () => {
    return {
        orderedItemPrice: {
            type: DataTypes.DOUBLE, // Represents a fixed-point number with precision 10 and scale 2
            allowNull: false,
            defaultValue: 0,
        },
        orderedItemQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0, // Default quantity value is set to 0
        },
    }
}
