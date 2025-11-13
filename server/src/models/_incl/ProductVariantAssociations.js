import Sequelize, { DataTypes } from "sequelize";
import { Settings } from "../_settings/Settings.js"

export const ProductVariantAssociations = ({Me, Product}) => {

    Me.belongsTo(Product, {
        as: 'product',
        foreignKey: 'productId',
        constraints: Settings.constraints,
    });
    Product.hasMany(Me, {
        as: 'variants',
        foreignKey: 'productId',
        constraints: Settings.constraints,
    });
}