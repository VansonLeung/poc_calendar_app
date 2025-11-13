# E-Shop Backend API

This project is an e-commerce backend API built using Node.js, Sequelize, and MySQL. The API manages various entities such as users, products, orders, and shops. This document provides an overview of the model structures used in the project.

## Features

- Support MySQL relational database
- Support content localization
- Support nested product types

## Models

### ERD

![erd](./doc/erd.svg)

### User Models

- **EBUser**
  - `id`: UUID (Primary Key)
  - `username`: STRING (Unique)
  - `email`: STRING (Unique)
  - `userRoleId`: UUID (Foreign Key)
  - Associations: Belongs to `EBUserRole`, Has many `EBUserContact`, `EBUserShipping`, `EBUserBilling`, `EBUserPayment`, `EBUserCartItem`, `EBUserCredential`, `EBUserSession`

- **EBUserRole**
  - `id`: UUID (Primary Key)
  - `code`: STRING
  - Associations: Has many `EBUser`, Belongs to many `EBUserPermission` through `EBUserRolePermissionMapping`

- **EBUserPermission**
  - `id`: UUID (Primary Key)
  - `code`: STRING (Unique)
  - Associations: Belongs to many `EBUserRole` through `EBUserRolePermissionMapping`

- **EBUserRolePermissionMapping**
  - `id`: UUID (Primary Key)
  - `userRoleId`: UUID (Foreign Key)
  - `userPermissionId`: UUID (Foreign Key)
  - Associations: Belongs to `EBUserRole`, Belongs to `EBUserPermission`

- **EBUserContact**
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key)
  - `firstName`: STRING
  - `lastName`: STRING
  - `email`: STRING
  - `phone`: STRING
  - `address`: STRING
  - `city`: STRING
  - `state`: STRING
  - `zip`: STRING
  - Associations: Belongs to `EBUser`

- **EBUserShipping**
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key)
  - `is_default`: BOOLEAN
  - `firstName`: STRING
  - `lastName`: STRING
  - `email`: STRING
  - `phone`: STRING
  - `address`: STRING
  - `city`: STRING
  - `state`: STRING
  - `zip`: STRING
  - Associations: Belongs to `EBUser`

- **EBUserBilling**
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key)
  - `is_default`: BOOLEAN
  - `firstName`: STRING
  - `lastName`: STRING
  - `email`: STRING
  - `phone`: STRING
  - `address`: STRING
  - `city`: STRING
  - `state`: STRING
  - `zip`: STRING
  - Associations: Belongs to `EBUser`

- **EBUserPayment**
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key)
  - `is_default`: BOOLEAN
  - `desc`: TEXT
  - `json`: JSON
  - Associations: Belongs to `EBUser`

- **EBUserCartItem**
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key)
  - `productId`: UUID (Foreign Key)
  - `ordered_price`: DECIMAL
  - `ordered_quantity`: INTEGER
  - `ordered_variants_json`: JSON
  - Associations: Belongs to `EBUser`, Belongs to `EBProduct`

- **EBUserCredential**
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key)
  - `type`: ENUM (password, google, facebook, twitter, github)
  - `password`: STRING
  - Associations: Belongs to `EBUser`

- **EBUserSession**
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key)
  - `userCredentialId`: UUID (Foreign Key)
  - `access_token`: STRING
  - `refresh_token`: STRING
  - Associations: Belongs to `EBUser`, Belongs to `EBUserCredential`

### Product Models

- **EBProduct**
  - `id`: UUID (Primary Key)
  - `name`: STRING
  - `price`: DECIMAL
  - `quantity`: INTEGER
  - `variants_json`: JSON
  - Associations: Belongs to many `EBShop` through `EBShopProductMapping`, Belongs to many `EBProductType` through `EBProductTypeProductMapping`

- **EBProductType**
  - `id`: UUID (Primary Key)
  - `name`: STRING
  - Associations: Belongs to many `EBShop` through `EBShopProductTypeMapping`, Belongs to many `EBProduct` through `EBProductTypeProductMapping`

- **EBProductTypeProductMapping**
  - `id`: UUID (Primary Key)
  - `productTypeId`: UUID (Foreign Key)
  - `productId`: UUID (Foreign Key)
  - Associations: Belongs to `EBProductType`, Belongs to `EBProduct`

### Order Models

- **EBOrder**
  - `id`: UUID (Primary Key)
  - `customerId`: UUID (Foreign Key)
  - Associations: Has many `EBOrderItem`, `EBOrderBilling`, `EBOrderShipping`, `EBOrderPayment`, `EBOrderInvoice`, `EBOrderStatus`

- **EBOrderItem**
  - `id`: UUID (Primary Key)
  - `orderId`: UUID (Foreign Key)
  - `productId`: UUID (Foreign Key)
  - `ordered_price`: DECIMAL
  - `ordered_quantity`: INTEGER
  - `ordered_variants_json`: JSON
  - Associations: Belongs to `EBOrder`, Belongs to `EBProduct`

- **EBOrderBilling**
  - `id`: UUID (Primary Key)
  - `orderId`: UUID (Foreign Key)
  - `firstName`: STRING
  - `lastName`: STRING
  - `email`: STRING
  - `phone`: STRING
  - `address`: STRING
  - `city`: STRING
  - `state`: STRING
  - `zip`: STRING
  - Associations: Belongs to `EBOrder`

- **EBOrderShipping**
  - `id`: UUID (Primary Key)
  - `orderId`: UUID (Foreign Key)
  - `firstName`: STRING
  - `lastName`: STRING
  - `email`: STRING
  - `phone`: STRING
  - `address`: STRING
  - `city`: STRING
  - `state`: STRING
  - `zip`: STRING
  - Associations: Belongs to `EBOrder`

- **EBOrderPayment**
  - `id`: UUID (Primary Key)
  - `orderId`: UUID (Foreign Key)
  - `desc`: TEXT
  - `json`: JSON
  - Associations: Belongs to `EBOrder`

- **EBOrderInvoice**
  - `id`: UUID (Primary Key)
  - `orderId`: UUID (Foreign Key)
  - `desc`: TEXT
  - `json`: JSON
  - Associations: Belongs to `EBOrder`

- **EBOrderStatus**
  - `id`: UUID (Primary Key)
  - `orderId`: UUID (Foreign Key)
  - `desc`: TEXT
  - `json`: JSON
  - Associations: Belongs to `EBOrder`

- **EBOrderItemStatus**
  - `id`: UUID (Primary Key)
  - `orderItemId`: UUID (Foreign Key)
  - `desc`: TEXT
  - `json`: JSON
  - Associations: Belongs to `EBOrderItem`

### Shop Models

- **EBShop**
  - `id`: UUID (Primary Key)
  - `name`: STRING
  - Associations: Belongs to many `EBProduct` through `EBShopProductMapping`, Belongs to many `EBProductType` through `EBShopProductTypeMapping`

- **EBShopOwnerMapping**
  - `id`: UUID (Primary Key)
  - `shopId`: UUID (Foreign Key)
  - `userId`: UUID (Foreign Key)
  - Associations: Belongs to `EBShop`, Belongs to `EBUser`

- **EBShopProductMapping**
  - `id`: UUID (Primary Key)
  - `shopId`: UUID (Foreign Key)
  - `productId`: UUID (Foreign Key)
  - Associations: Belongs to `EBShop`, Belongs to `EBProduct`

- **EBShopProductTypeMapping**
  - `id`: UUID (Primary Key)
  - `shopId`: UUID (Foreign Key)
  - `productTypeId`: UUID (Foreign Key)
  - Associations: Belongs to `EBShop`, Belongs to `EBProductType`

- **EBShopOrderMapping**
  - `id`: UUID (Primary Key)
  - `shopId`: UUID (Foreign Key)
  - `orderId`: UUID (Foreign Key)
  - Associations: Belongs to `EBShop`, Belongs to `EBOrder`

### Other Models

- **EBLang**
  - `id`: UUID (Primary Key)
  - `code`: STRING (Unique)
  - Associations: None

- **EBPost**
  - `id`: UUID (Primary Key)
  - `name`: STRING
  - `desc`: TEXT
  - `json`: JSON
  - Associations: Belongs to `EBLang`

- **EBPostType**
  - `id`: UUID (Primary Key)
  - `name`: STRING
  - Associations: Belongs to many `EBPost` through `EBPostTypePostMapping`

- **EBPostTypePostMapping**
  - `id`: UUID (Primary Key)
  - `postTypeId`: UUID (Foreign Key)
  - `postId`: UUID (Foreign Key)
  - Associations: Belongs to `EBPostType`, Belongs to `EBPost`

- **EBDiscountCampaign**
  - `id`: UUID (Primary Key)
  - `name`: STRING
  - `desc`: TEXT
  - `json`: JSON
  - Associations: Belongs to `EBLang`

- **EBCustomerOrderMapping**
  - `id`: UUID (Primary Key)
  - `customerId`: UUID (Foreign Key)
  - `orderId`: UUID (Foreign Key)
  - Associations: Belongs to `EBUser`, Belongs to `EBOrder`

## Indexes

Indexes are created for attributes that are frequently queried to improve performance. The `SchemaToIndexes` helper function is used to generate indexes based on the schema definitions.

## Associations

Associations define the relationships between different models. They are created using Sequelize's `belongsTo`, `hasMany`, and `belongsToMany` methods. The `Settings.constraints` option is used to enable or disable foreign key constraints.

## Attributes

Attributes define the columns in the database tables. They are created using Sequelize's `DataTypes` and are grouped into reusable modules such as `BasicAttributes`, `DatedStatusAttributes`, `ContentAttributes`, etc.

## Running the Project

To run the project, use the following command:

```sh
node index.js
```

