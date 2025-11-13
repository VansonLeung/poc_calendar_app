import { _APIGenericCRUD } from "./_incl/index.js";

export const APIOrderItem = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `OrderItem`,
            collectionModel: models.OrderItem,
        })
    }
}

