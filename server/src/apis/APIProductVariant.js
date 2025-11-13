import { _APIGenericCRUD } from "./_incl/index.js";

export const APIProductVariant = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `ProductVariant`,
            collectionModel: models.ProductVariant,
        })
    }
}

