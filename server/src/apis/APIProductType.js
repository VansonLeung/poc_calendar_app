import { _APIGenericCRUD } from "./_incl/index.js";

export const APIProductType = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `ProductType`,
            collectionModel: models.ProductType,
        })
    }
}

