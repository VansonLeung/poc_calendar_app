import { _APIGenericCRUD } from "./_incl/index.js";

export const APIUser = {
    initialize: ({ app, appWithMeta, models }) => {
        _APIGenericCRUD.initialize({ 
            app,
            appWithMeta,
            collectionName: `User`,
            collectionModel: models.User,
        })
    }
}

