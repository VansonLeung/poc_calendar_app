import { _APIGenericCRUD } from "./_incl/index.js"

export const APIOrder = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `Order`,
            collectionModel: models.Order,
        })
    }
}

