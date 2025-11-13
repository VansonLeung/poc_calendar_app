import { _APIGenericCRUD } from "./_incl/index.js";

export const APIProduct = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `Product`,
            collectionModel: models.Product,
        })
    }
}

