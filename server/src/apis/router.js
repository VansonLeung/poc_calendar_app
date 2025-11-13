import express from 'express';
import { _routerWithMeta } from './_incl/index.js';
import { APIOrder } from "./APIOrder.js";
import { APIOrderItem } from "./APIOrderItem.js";
import { APIProduct } from "./APIProduct.js";
import { APIProductType } from "./APIProductType.js";
import { APIProductVariableField } from "./APIProductVariableField.js";
import { APIProductVariableFieldValue } from "./APIProductVariableFieldValue.js";
import { APIProductVariant } from "./APIProductVariant.js";
import { APIShop } from "./APIShop.js";
import { APIUser } from './APIUser.js';
import { APIUserAuth } from './APIUserAuth.js';

export const Router = {
    initialize: ({ app, models }) => {
        const router = express.Router()
        const meta = {}
        const routerWithMeta = _routerWithMeta({ router, meta });

        APIUserAuth.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIUser.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIOrder.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIOrderItem.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIProduct.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIProductType.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIProductVariableField.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIProductVariableFieldValue.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIProductVariant.initialize({ app: router, appWithMeta: routerWithMeta, models });
        APIShop.initialize({ app: router, appWithMeta: routerWithMeta, models });
        
        app.meta = meta;

        return router;
    },
}
