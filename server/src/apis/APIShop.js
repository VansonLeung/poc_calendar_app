import { _APIGenericCRUD } from "./_incl/index.js";

export const APIShop = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `Shop`,
            collectionModel: models.Shop,
        })
    }
}

