import { _APIGenericCRUD } from "./_incl/index.js";

export const APIProductVariableFieldValue = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `ProductVariableFieldValue`,
            collectionModel: models.ProductVariableFieldValue,
        })
    }
}

