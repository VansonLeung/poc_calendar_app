import Sequelize, { DataTypes } from "sequelize";

export const ProductVariantAttributes = () => {
    return {
        productId: { 
            type: DataTypes.UUID,
            index: true,
            uniqueGroups: [{name: "ps", order: 0}],
        },
        sku: {
            type: DataTypes.STRING(64),
            index: true,
            uniqueGroups: [{name: "ps", order: 1}],
        },
        price: {
            type: DataTypes.DOUBLE, // Represents a fixed-point number with precision 10 and scale 2
            allowNull: false,
            defaultValue: 0.00, // Default price value is set to 0.00
            index: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0, // Default quantity value is set to 0
            index: true,
        },
    }
}
