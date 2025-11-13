import { recursiveMassageIncludeClause } from './_APIQueryIncludeClauseMassager.js';
import { recursiveMassageWhereClause } from './_APIQueryWhereClauseMassager.js';

export const _APIGenericAssociations = {
    initialize: ({
        app,
        appWithMeta,
        collectionName,
        collectionModel,
    }) => {

        if (!collectionModel) {
            return;
        }

        const associations = collectionModel.associations || {};
        
        for (var key in associations) {
            const targetName = associations[key].target.name;
            const targetModel = associations[key].target;
            const actions = associations[key].accessors;
            const isMultiple = associations[key].isMultiAssociation;

            console.log(associations[key])

            for (var actionKey in actions) {
                const itemActionFnKey = actions[actionKey];

                if (actionKey === "create") {
                    appWithMeta.post(`/api/${collectionName}/:id/${key}/${actionKey}`, {
                        parameters: [
                            { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: `#/components/schemas/${targetName}`,
                                    }
                                }
                            }
                        }
                    }, async (req, res) => {
                        console.log(req.route.path);
                        try {
                            const srcItem = await collectionModel.findByPk(req.params.id);
                            const item = await srcItem[itemActionFnKey](req.body);
                            res.sendResponse({status: 201, data: item, });
                        } catch (error) {
                            res.sendError({error, });
                        }
                    });
                }

                else if (actionKey === "set") {
                    appWithMeta.patch(`/api/${collectionName}/:id/${key}/${actionKey}/:targetIds`, {
                        parameters: [
                            { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } },
                            { name: 'targetIds', in: 'path', required: true, schema: { type: 'string', default: "" }, description: "id value(s) separated by `,`", },
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: `#/components/schemas/${targetName}`,
                                    }
                                }
                            }
                        }
                    }, async (req, res) => {
                        console.log(req.route.path);
                        try {
                            if (isMultiple) {
                                const srcItem = await collectionModel.findByPk(req.params.id);
    
                                if (!srcItem) {
                                    res.sendError({status: 404, error: new Error(`${collectionName} ${req.params.id} not found`), });
                                    return;
                                }

                                const targetItemIds = req.params.targetIds.split(",");
    
                                const response = await srcItem[itemActionFnKey](targetItemIds);
                                res.sendResponse({status: 201, data: response, });
    
                            } else {
                                const srcItem = await collectionModel.findByPk(req.params.id);
                                const targetItem = await targetModel.findByPk(req.params.targetIds);
    
                                if (!srcItem) {
                                    res.sendError({status: 404, error: new Error(`${collectionName} ${req.params.id} not found`), });
                                    return;
                                }
    
                                if (!targetItem) {
                                    res.sendError({status: 404, error: new Error(`${key} ${req.params.targetIds} not found`), });
                                    return;
                                }
    
                                const response = await srcItem[itemActionFnKey](targetItem);
                                res.sendResponse({status: 201, data: response, });
    
                            }
                        } catch (error) {
                            res.sendError({error, });
                        }
                    });
                }

                else if (actionKey === "add" || actionKey === "remove") {
                    const __actionKey = actionKey;
                    appWithMeta.patch(`/api/${collectionName}/:id/${key}/${actionKey}/:targetId`, {
                        parameters: [
                            { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } },
                            { name: 'targetId', in: 'path', required: true, schema: { type: 'string', default: "" } },
                        ],
                    }, async (req, res) => {
                        console.log(req.route.path);
                        try {
                            const srcItem = await collectionModel.findByPk(req.params.id);
                            const targetItem = await targetModel.findByPk(req.params.targetId);

                            if (!srcItem) {
                                res.sendError({status: 404, error: new Error(`${collectionName} ${req.params.id} not found`), });
                                return;
                            }

                            if (!targetItem) {
                                res.sendError({status: 404, error: new Error(`${key} ${req.params.targetId} not found`), });
                                return;
                            }

                            const response = await srcItem[itemActionFnKey](targetItem);

                            if (__actionKey === "add") {
                                res.sendResponse({status: 201, });
                            } else if (__actionKey === "remove") {
                                res.sendResponse({status: 201, });
                            } else {
                                res.sendResponse({status: 200, });
                            }
                        } catch (error) {
                            res.sendError({error, });
                        }
                    });
                }

                else if (actionKey === "addMultiple" || actionKey === "removeMultiple") {
                    const __actionKey = actionKey;
                    appWithMeta.patch(`/api/${collectionName}/:id/${key}/${actionKey}/:targetIds`, {
                        parameters: [
                            { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } },
                            { name: 'targetIds', in: 'path', required: true, schema: { type: 'string', default: "" }, description: "id value(s) separated by `,`", },
                        ],
                    }, async (req, res) => {
                        console.log(req.route.path);
                        try {
                            const srcItem = await collectionModel.findByPk(req.params.id);
    
                            if (!srcItem) {
                                res.sendError({status: 404, error: new Error(`${collectionName} ${req.params.id} not found`), });
                                return;
                            }

                            const targetItemIds = req.params.targetIds.split(",");

                            const response = await srcItem[itemActionFnKey](targetItemIds);

                            if (__actionKey === "addMultiple") {
                                res.sendResponse({status: 201, });
                            } else if (__actionKey === "removeMultiple") {
                                res.sendResponse({status: 201, });
                            } else {
                                res.sendResponse({status: 200, });
                            }
    
                        } catch (error) {
                            res.sendError({error, });
                        }
                    });
                }

                else if (actionKey === "count") {
                    appWithMeta.get(`/api/${collectionName}/:id/${key}/countlist`, {
                        parameters: [
                            { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } },
                            { in: "query", name: "filter", schema: {type: "string", default: ""}, description: "`whereClause` as *JSON string*, recursive; Supports: `$like`, `$gt`, `$lt`, `$gte`, `$lte`, `$in`, `$not`, `$notIn`<br/>Example: <br/>`{  \"where\": {  \"$or\": [{ \"authorId\": 12 }, { \"authorId\": 13 }]  } }` ", },
                            { in: "query", name: "sort", schema: {type: "string", default: ""}, description: "`orderClause` as *JSON string*, <br/>Example: <br/>`['title', 'DESC']`<br/>`[['title', 'ASC'], ['max(age)', 'ASC']]` ", },
                            { in: "query", name: "group", schema: {type: "string", default: ""}, description: "`groupClause` as *string*", },
                            { in: "query", name: "join", schema: {type: "string", default: ""}, description: "`includeClause` as *JSON string*, <br/>Example: <br/>`{ include: { association: 'Instruments' } }` ", },
                            { in: "query", name: "offset", schema: {type: "number", default: ""}, description: "`offsetClause` as *number*, <br/>Example: <br/>`10` ", },
                            { in: "query", name: "limit", schema: {type: "number", default: ""}, description: "`limitClause` as *number*, <br/>Example: <br/>`5` ", },
                            { in: "query", name: "isCount", schema: {type: "boolean", default: ""}, description: "if `isCount` is `true`, the response data shall be a count of the query rows.", },
                        ],
                    }, async (req, res) => {
                        console.log(req.route.path);
                        try {
                            const srcItem = await collectionModel.findByPk(req.params.id);

                            if (!srcItem) {
                                res.sendError({status: 404, error: new Error(`${collectionName} ${req.params.id} not found`), });
                                return;
                            }


                            const { filter, sort, group, join, offset, limit  } = req.query; // Extract filter, sort, and join from query parameters
    
                            // Build the where clause for filtering
                            const whereClause = filter ? JSON.parse(filter) : undefined; // Assuming filter is a JSON string
            
                            if (whereClause) {
                                recursiveMassageWhereClause(whereClause);
                            }
        
                            // Build the order clause for sorting
                            // format: ['title', 'DESC']
                            // format: [['title', 'DESC'], ['max(age)', 'DESC']]
                            const orderClause = sort ? JSON.parse(sort) : undefined; // Split by comma for multiple fields
            
                            // Build the group clause for grouping
                            const groupClause = group || undefined;
                            
                            // Build the include clause for joining
                            const includeClause = join ? JSON.parse(join) : undefined;
            
                            if (includeClause) {
                                recursiveMassageIncludeClause(includeClause);
                            }
            
                            // Build the offset clause for offseting
                            const offsetClause = offset || undefined;
                            
                            // Build the limit clause for limiting
                            const limitClause = limit || undefined;
            


                            const targetItems = await srcItem[itemActionFnKey]({
                                ...whereClause ? {where: whereClause} : null,
                                ...orderClause ? {order: orderClause} : null,
                                ...groupClause !== undefined ? {group: groupClause} : null,
                                ...includeClause ? {include: includeClause} : null,
                                ...offsetClause !== undefined ? {offset: Number(offsetClause)} : null,
                                ...limitClause !== undefined ? {limit: Number(limitClause)} : null,
                            });
                            res.sendResponse({status: 200, data: targetItems.count, });

                        } catch (error) {
                            res.sendError({error, });
                        }
                    });
                }

                else if (actionKey === "get") {
                    if (isMultiple) {
                        appWithMeta.get(`/api/${collectionName}/:id/${key}/getlist`, {
                            parameters: [
                                { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } },
                                { in: "query", name: "filter", schema: {type: "string", default: ""}, description: "`whereClause` as *JSON string*, recursive; Supports: `$like`, `$gt`, `$lt`, `$gte`, `$lte`, `$in`, `$not`, `$notIn`<br/>Example: <br/>`{  \"where\": {  \"$or\": [{ \"authorId\": 12 }, { \"authorId\": 13 }]  } }` ", },
                                { in: "query", name: "sort", schema: {type: "string", default: ""}, description: "`orderClause` as *JSON string*, <br/>Example: <br/>`['title', 'DESC']`<br/>`[['title', 'ASC'], ['max(age)', 'ASC']]` ", },
                                { in: "query", name: "group", schema: {type: "string", default: ""}, description: "`groupClause` as *string*", },
                                { in: "query", name: "join", schema: {type: "string", default: ""}, description: "`includeClause` as *JSON string*, <br/>Example: <br/>`{ include: { association: 'Instruments' } }` ", },
                                { in: "query", name: "offset", schema: {type: "number", default: ""}, description: "`offsetClause` as *number*, <br/>Example: <br/>`10` ", },
                                { in: "query", name: "limit", schema: {type: "number", default: ""}, description: "`limitClause` as *number*, <br/>Example: <br/>`5` ", },
                                { in: "query", name: "isCount", schema: {type: "boolean", default: ""}, description: "if `isCount` is `true`, the response data shall be a count of the query rows.", },
                            ],
                        }, async (req, res) => {
                            console.log(req.route.path);
                            try {
                                const srcItem = await collectionModel.findByPk(req.params.id);
    
                                if (!srcItem) {
                                    res.sendError({status: 404, error: new Error(`${collectionName} ${req.params.id} not found`), });
                                    return;
                                }


                                const { filter, sort, group, join, offset, limit  } = req.query; // Extract filter, sort, and join from query parameters
        
                                // Build the where clause for filtering
                                const whereClause = filter ? JSON.parse(filter) : undefined; // Assuming filter is a JSON string
                
                                if (whereClause) {
                                    recursiveMassageWhereClause(whereClause);
                                }
                
                                // Build the order clause for sorting
                                // format: ['title', 'DESC']
                                // format: [['title', 'DESC'], ['max(age)', 'DESC']]
                                const orderClause = sort ? JSON.parse(sort) : undefined; // Split by comma for multiple fields
                
                                // Build the group clause for grouping
                                const groupClause = group || undefined;
                                
                                // Build the include clause for joining
                                const includeClause = join ? JSON.parse(join) : undefined;
                
                                if (includeClause) {
                                    recursiveMassageIncludeClause(includeClause);
                                }

                                // Build the offset clause for offseting
                                const offsetClause = offset || undefined;
                                
                                // Build the limit clause for limiting
                                const limitClause = limit || undefined;
                

    
                                const targetItems = await srcItem[itemActionFnKey]({
                                    ...whereClause ? {where: whereClause} : null,
                                    ...orderClause ? {order: orderClause} : null,
                                    ...groupClause !== undefined ? {group: groupClause} : null,
                                    ...includeClause ? {include: includeClause} : null,
                                    ...offsetClause !== undefined ? {offset: Number(offsetClause)} : null,
                                    ...limitClause !== undefined ? {limit: Number(limitClause)} : null,
                                });
                                res.sendResponse({status: 200, data: targetItems, });
    
                            } catch (error) {
                                res.sendError({error, });
                            }
                        });
    
                    } else {
                        appWithMeta.get(`/api/${collectionName}/:id/${key}/get`, {
                            parameters: [
                                { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } },
                                { in: "query", name: "join", schema: {type: "string", default: ""}, description: "`includeClause` as *JSON string*, <br/>Example: <br/>`{ include: { association: 'Instruments' } }` ", },
                            ],
                        }, async (req, res) => {
                            console.log(req.route.path);
                            try {
                                const { join, } = req.query;

                                // Build the include clause for joining
                                const includeClause = join ? JSON.parse(join) : undefined;

                                if (includeClause) {
                                    recursiveMassageIncludeClause(includeClause);
                                }

                                const srcItem = await collectionModel.findByPk(req.params.id, {
                                    ...includeClause ? {include: includeClause} : null,
                                });
    
                                if (!srcItem) {
                                    res.sendError({status: 404, error: new Error(`${collectionName} ${req.params.id} not found`), });
                                    return;
                                }
    
                                const targetItem = await srcItem[itemActionFnKey]();
    
                                if (!targetItem) {
                                    res.sendError({status: 404, error: new Error(`${key} not found`), });
                                    return;
                                }

                                res.sendResponse({status: 200, data: targetItem, });
    
                            } catch (error) {
                                res.sendError({error, });
                            }
                        });
    
                    }

                }
            }
        }
    }
}

