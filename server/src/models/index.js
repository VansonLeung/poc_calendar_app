import { writeFileSync, mkdirSync } from 'fs';
import { Sequelize, Op } from "sequelize";
import sequelizeErd from 'sequelize-erd';
import { SchemaToIndexes } from "./_helpers/SequelizeSchemaHelper.js";
import {
    // EBARefOrderStatusCodes,
    EBCustomerOrderMapping,
    EBDiscountCampaign,
    EBLang,
    EBOrder,
    EBOrderBilling,
    EBOrderInvoice,
    EBOrderItem,
    EBOrderItemStatus,
    EBOrderPayment,
    EBOrderShipping,
    EBOrderStatus,
    // EBParty,
    EBPost,
    EBPostType,
    EBPostTypePostMapping,
    EBProduct,
    EBProductType,
    EBProductTypeProductMapping,
    EBProductVariableField,
    EBProductVariableFieldValue,
    EBProductVariant,
    EBProductVariantVarMapping,
    EBShop,
    EBShopOrderMapping,
    EBShopOwnerMapping,
    EBShopProductMapping,
    EBShopProductTypeMapping,
    EBUser,
    EBUserBilling,
    EBUserCartItem,
    EBUserContact,
    EBUserCredential,
    EBUserPayment,
    EBUserPermission,
    EBUserRole,
    EBUserRolePermissionMapping,
    EBUserSession,
    EBUserShipping,
    EBUserStatus,
} from './stores/index.js';

export const initializeModels = async () => 
{
    const sequelize = new Sequelize(process.env.DB_NAME || 'eshopcms1_dev', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'password', {
        dialect: 'mysql',
        host: process.env.DB_HOST || "127.0.0.1",
        port: process.env.DB_PORT || 3306,
        dialectOptions: {
          // Your mysql2 options here
        //   socketPath: '/tmp/mysql.sock',
        },
    });
    
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const UserPermission = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserPermission', EBUserPermission.makeSchema());
        const UserRole = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserRole', EBUserRole.makeSchema());
        const UserRolePermissionMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserRolePermissionMapping', EBUserRolePermissionMapping.makeSchema());
    
        const User = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('User', EBUser.makeSchema());
        const UserCredential = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserCredential', EBUserCredential.makeSchema());
        const UserSession = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserSession', EBUserSession.makeSchema());
        const UserContact = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserContact', EBUserContact.makeSchema());
        const UserShipping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserShipping', EBUserShipping.makeSchema());
        const UserBilling = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserBilling', EBUserBilling.makeSchema());
        const UserPayment = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserPayment', EBUserPayment.makeSchema());
        const UserCartItem = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('UserCartItem', EBUserCartItem.makeSchema());
    
        const Shop = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('Shop', EBShop.makeSchema());
        const ShopOwnerMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ShopOwnerMapping', EBShopOwnerMapping.makeSchema());
        
        const Product = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('Product', EBProduct.makeSchema());
        const ProductType = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ProductType', EBProductType.makeSchema(), { indexes: SchemaToIndexes(EBProductType.makeSchema()), });
    
        const ProductVariableField = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ProductVariableField', EBProductVariableField.makeSchema());
        const ProductVariableFieldValue = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ProductVariableFieldValue', EBProductVariableFieldValue.makeSchema());

        const ProductVariant = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ProductVariant', EBProductVariant.makeSchema());
        const ProductVariantVarMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ProductVariantVarMapping', EBProductVariantVarMapping.makeSchema());

        const ShopProductMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ShopProductMapping', EBShopProductMapping.makeSchema());
        
        const ProductTypeProductMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ProductTypeProductMapping', EBProductTypeProductMapping.makeSchema());

        const ShopProductTypeMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ShopProductTypeMapping', EBShopProductTypeMapping.makeSchema());

        const Lang = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('Lang', EBLang.makeSchema());

        const Post = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('Post', EBPost.makeSchema());
        const PostType = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('PostType', EBPostType.makeSchema());
        const PostTypePostMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('PostTypePostMapping', EBPostTypePostMapping.makeSchema());
        
        const Order = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('Order', EBOrder.makeSchema());
        const OrderItem = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('OrderItem', EBOrderItem.makeSchema());
        
        const OrderBilling = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('OrderBilling', EBOrderBilling.makeSchema());
        const OrderShipping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('OrderShipping', EBOrderShipping.makeSchema());
        const OrderPayment = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('OrderPayment', EBOrderPayment.makeSchema());
        const OrderInvoice = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('OrderInvoice', EBOrderInvoice.makeSchema());

        const OrderStatus = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('OrderStatus', EBOrderStatus.makeSchema());
        const OrderItemStatus = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('OrderItemStatus', EBOrderItemStatus.makeSchema());

        const ShopOrderMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('ShopOrderMapping', EBShopOrderMapping.makeSchema());

        const CustomerOrderMapping = ((tableName, schema) => { return sequelize.define(tableName, schema, { indexes: SchemaToIndexes(schema), }); })('CustomerOrderMapping', EBCustomerOrderMapping.makeSchema());

    
        EBUserPermission.makeAssociations({Me: UserPermission, });
        EBUserRole.makeAssociations({Me: UserRole, });
        EBUserRolePermissionMapping.makeAssociations({Me: UserRolePermissionMapping, UserPermission, UserRole, });
    
        EBUser.makeAssociations({Me: User, UserRole, });
        EBUserCredential.makeAssociations({Me: UserCredential, User, });
        EBUserSession.makeAssociations({Me: UserSession, User, UserCredential, });
        EBUserContact.makeAssociations({Me: UserContact, User, });
        EBUserShipping.makeAssociations({Me: UserShipping, User, });
        EBUserBilling.makeAssociations({Me: UserBilling, User, });
        EBUserPayment.makeAssociations({Me: UserPayment, User, });
        EBUserCartItem.makeAssociations({Me: UserCartItem, User, Product, });
    
        EBShop.makeAssociations({Me: Shop, Lang, });
        EBShopOwnerMapping.makeAssociations({Me: ShopOwnerMapping, Shop, User, });
        
        EBProduct.makeAssociations({Me: Product, Lang, });
        EBProductType.makeAssociations({Me: ProductType, Lang, });
    
        EBProductVariableField.makeAssociations({Me: ProductVariableField, Product, });
        EBProductVariableFieldValue.makeAssociations({Me: ProductVariableFieldValue, ProductVariableField, });
        
        EBProductVariant.makeAssociations({Me: ProductVariant, Lang, Product, });
        EBProductVariantVarMapping.makeAssociations({Me: ProductVariantVarMapping, ProductVariant, ProductVariableFieldValue, })

        EBShopProductMapping.makeAssociations({Me: ShopProductMapping, Shop, Product, });
    
        EBProductTypeProductMapping.makeAssociations({Me: ProductTypeProductMapping, ProductType, Product, });

        EBShopProductTypeMapping.makeAssociations({Me: ShopProductTypeMapping, Shop, ProductType, });
    
        EBLang.makeAssociations({Me: Lang, });

        EBPost.makeAssociations({Me: Post, Lang, });
        EBPostType.makeAssociations({Me: PostType, Lang, });
        EBPostTypePostMapping.makeAssociations({Me: PostTypePostMapping, PostType, Post, });

        EBOrder.makeAssociations({Me: Order, Customer: User, });
        EBOrderItem.makeAssociations({Me: OrderItem, Order, Product, ProductVariant, });

        EBOrderBilling.makeAssociations({Me: OrderBilling, Order, });
        EBOrderShipping.makeAssociations({Me: OrderShipping, Order, });
        EBOrderPayment.makeAssociations({Me: OrderPayment, Order, });
        EBOrderInvoice.makeAssociations({Me: OrderInvoice, Order, });
        EBOrderStatus.makeAssociations({Me: OrderStatus, Order, });
        EBOrderItemStatus.makeAssociations({Me: OrderItemStatus, OrderItem, });

        EBShopOrderMapping.makeAssociations({Me: ShopOrderMapping, Shop, Order, });

        EBCustomerOrderMapping.makeAssociations({Me: CustomerOrderMapping, Customer: User, Order, });

        await sequelize.sync({
            force: false,
            alter: false,
        });


        (async function(){
            // mkdirSync('./doc', { recursive: true });
            // let output = await sequelizeErd({ source: sequelize, format: 'dot', }); // sequelizeErd() returns a Promise
            // output = output
            // .replace(/rankdir=LR,/, "rankdir=TB,")
            // .replace(/ranksep=2/, "ranksep=1")
            // writeFileSync('./doc/erd.dot', output);
          
            // Writes erd.svg to local path with SVG file from your Sequelize models
        })();




        return {
            UserPermission,
            UserRole,
            UserRolePermissionMapping,
            User,
            UserCredential,
            UserSession,
            UserContact,
            UserShipping,
            UserBilling,
            UserPayment,
            UserCartItem,
            Shop,
            ShopOwnerMapping,
            Product,
            ProductType,
            ProductVariableField,
            ProductVariableFieldValue,
            ProductVariant,
            ProductVariantVarMapping,
            ShopProductMapping,
            ProductTypeProductMapping,
            ShopProductTypeMapping,
            Lang,
            Post,
            PostType,
            PostTypePostMapping,
            Order,
            OrderItem,
            OrderBilling,
            OrderShipping,
            OrderPayment,
            OrderInvoice,
            OrderStatus,
            OrderItemStatus,
            ShopOrderMapping,
            CustomerOrderMapping,
        }
        
    
    } catch (error) {
        console.error('Unable to connect to the database:', error);

        return null;
    }
}

