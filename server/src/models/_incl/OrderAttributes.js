import Sequelize, { DataTypes } from "sequelize";

export const OrderAttributes = () => {
    return {
        orderRemarks: {
            type: DataTypes.TEXT,
        },
        orderStatus: {
            type: DataTypes.STRING(16),
            index: true,
        },
        orderDate: {
            type: DataTypes.DATE,
            index: true,
        },
        orderPickupDate: {
            type: DataTypes.DATE,
            index: true,
        },
        orderDeliveryMethod: {
            type: DataTypes.STRING(16),
            index: true,
        },
        orderPaymentMethod: {
            type: DataTypes.STRING(16),
            index: true,
        },
        orderPaymentStatus: {
            type: DataTypes.STRING(16),
            index: true,
        },
    }
}
