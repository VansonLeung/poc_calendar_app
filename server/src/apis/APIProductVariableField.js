import { _APIGenericCRUD } from "./_incl/index.js";

export const APIProductVariableField = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `ProductVariableField`,
            collectionModel: models.ProductVariableField,
        })
    }
}

