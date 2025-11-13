import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicSeqIdlessAttributes, 
    OrderItemAttributes, 
    ParentChildAssociations, 
    ParentChildAttributes,
} from "../_incl/index.js";

export const EBOrderItem = {
    makeAssociations: ({Me, Order, Product, ProductVariant}) => {
        Me.belongsTo(Order, {
            foreignKey: 'orderId',
            as: 'order',
            constraints: Settings.constraints,
        });
        Order.hasMany(Me, {
            foreignKey: 'orderId',
            as: 'orderItems',
            constraints: Settings.constraints,
        });

        Me.belongsTo(Product, {
            foreignKey: 'productId',
            as: 'product',
            constraints: Settings.constraints,
        });
        Product.hasMany(Me, {
            foreignKey: 'productId',
            as: 'orderItems',
            constraints: Settings.constraints,
        });

        Me.belongsTo(ProductVariant, {
            foreignKey: 'productVariantId',
            as: 'productVariant',
            constraints: Settings.constraints,
        });
        ProductVariant.hasMany(Me, {
            foreignKey: 'productVariantId',
            as: 'orderItems',
            constraints: Settings.constraints,
        });

        ParentChildAssociations({ Me });
    },

    makeSchema: () => {
        return {
            ...BasicSeqIdlessAttributes(),
            orderId: {
                type: DataTypes.UUID,
                index: true,
            },
            productId: {
                type: DataTypes.UUID,
                index: true,
            },
            productVariantId: {
                type: DataTypes.UUID,
                index: true,
            },
            ...OrderItemAttributes(),
            ...ParentChildAttributes(),
        }
    },
};

