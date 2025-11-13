import { _APIGenericAssociations } from "./_APIGenericAssociations.js";
import { recursiveMassageIncludeClause } from "./_APIQueryIncludeClauseMassager.js";
import { recursiveMassageWhereClause } from './_APIQueryWhereClauseMassager.js';

export const _APIGenericCRUD = {
    initialize: ({
        app,
        appWithMeta,
        collectionName,
        collectionModel,
    }) => {

        // Create a Item
        appWithMeta.post(`/api/${collectionName}`, {
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: `#/components/schemas/${collectionName}`,
                        }
                    }
                }
            }
        }, async (req, res) => {
            try {
                const item = await collectionModel.create(req.body);
                res.sendResponse({status: 201, data: item, });
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });

        // Read all Items
        appWithMeta.get(`/api/${collectionName}`, {
            parameters: [
                { in: "query", name: "filter", schema: {type: "string", default: ""}, description: "`whereClause` as *JSON string*, recursive; Supports: `$like`, `$gt`, `$lt`, `$gte`, `$lte`, `$in`, `$not`, `$notIn`<br/>Example: <br/>`{  \"where\": {  \"$or\": [{ \"authorId\": 12 }, { \"authorId\": 13 }]  } }` ", },
                { in: "query", name: "sort", schema: {type: "string", default: ""}, description: "`orderClause` as *JSON string*, <br/>Example: <br/>`['title', 'DESC']`<br/>`[['title', 'ASC'], ['max(age)', 'ASC']]` ", },
                { in: "query", name: "group", schema: {type: "string", default: ""}, description: "`groupClause` as *string*", },
                { in: "query", name: "join", schema: {type: "string", default: ""}, description: "`includeClause` as *JSON string*, <br/>Example: <br/>`{ include: { association: 'Instruments' } }` ", },
                { in: "query", name: "offset", schema: {type: "number", default: ""}, description: "`offsetClause` as *number*, <br/>Example: <br/>`10` ", },
                { in: "query", name: "limit", schema: {type: "number", default: ""}, description: "`limitClause` as *number*, <br/>Example: <br/>`5` ", },
                { in: "query", name: "isCount", schema: {type: "boolean", default: ""}, description: "if `isCount` is `true`, the response data shall be a count of the query rows.", },
            ],
        }, async (req, res) => {
            try {
                const { filter, sort, group, join, offset, limit, isCount = false,  } = req.query; // Extract filter, sort, and join from query parameters
        
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

                if (isCount && !(isCount === "false" || isCount === "False")) {
                    const count = await collectionModel.count({
                        ...whereClause ? {where: whereClause} : null,
                        ...orderClause ? {order: orderClause} : null,
                        ...groupClause !== undefined ? {group: groupClause} : null,
                        ...includeClause ? {include: includeClause} : null,
                        ...offsetClause !== undefined ? {offset: Number(offsetClause)} : null,
                        ...limitClause !== undefined ? {limit: Number(limitClause)} : null,
                    });
                    res.sendResponse({status: 200, data: count, });
                    return;
                }

                const items = await collectionModel.findAll({
                    ...whereClause ? {where: whereClause} : null,
                    ...orderClause ? {order: orderClause} : null,
                    ...groupClause !== undefined ? {group: groupClause} : null,
                    ...includeClause ? {include: includeClause} : null,
                    ...offsetClause !== undefined ? {offset: Number(offsetClause)} : null,
                    ...limitClause !== undefined ? {limit: Number(limitClause)} : null,
                });
                res.sendResponse({status: 200, data: items, });
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });

        // Read a Item by ID
        appWithMeta.get(`/api/${collectionName}/:id`, {
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } },
                { in: "query", name: "join", schema: {type: "string", default: ""}, description: "`includeClause` as *JSON string*, <br/>Example: <br/>`{ include: { association: 'Instruments' } }` ", },
            ],
        }, async (req, res) => {
            try {
                const { join, } = req.query;

                // Build the include clause for joining
                const includeClause = join ? JSON.parse(join) : undefined;

                if (includeClause) {
                    recursiveMassageIncludeClause(includeClause);
                }

                const item = await collectionModel.findByPk(req.params.id, {
                    ...includeClause ? {include: includeClause} : null,
                });
                if (item) {
                    res.sendResponse({status: 200, data: item, });
                } else {
                    res.sendError({status: 404, error: new Error(`${collectionName} not found`), });
                }
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });

        // Update a Item
        appWithMeta.put(`/api/${collectionName}/:id`, {
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: `#/components/schemas/${collectionName}`,
                        }
                    }
                }
            }
        }, async (req, res) => {
            try {
                const [updated] = await collectionModel.update(req.body, {
                    where: { id: req.params.id }
                });
                if (updated) {
                    const updatedItem = await collectionModel.findByPk(req.params.id);
                    res.sendResponse({status: 201, data: updatedItem, });
                } else {
                    res.sendError({status: 404, error: new Error(`${collectionName} not found`), });
                }
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });

        // Delete a Item
        appWithMeta.delete(`/api/${collectionName}/:id`, {
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string', default: "" } }
            ],
        }, async (req, res) => {
            try {
                const deleted = await collectionModel.destroy({
                    where: { id: req.params.id }
                });
                if (deleted) {
                    res.sendResponse({status: 204});
                } else {
                    res.sendError({status: 404, error: new Error(`${collectionName} not found`), });
                }
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });

        // Bulk create / update items
        appWithMeta.post(`/api/${collectionName}/bulk`, {
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: `#/components/schemas/${collectionName}`,
                            }
                        }
                    }
                }
            }
        }, async (req, res) => {
            try {
                const responseData = [];
                for (const item of req.body) {
                    const [upsertedItem, isCreated] = await collectionModel.upsert(item);
                    responseData.push({upsertedItem, isCreated});
                }
                res.sendResponse({status: 201, data: true, });
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });


        // Bulk delete items
        appWithMeta.delete(`/api/${collectionName}/:ids/bulk`, {
            parameters: [
                { name: 'ids', in: 'path', required: true, schema: { type: 'array', items: { type: 'string' }, default: [] } }
            ],  
        }, async (req, res) => {
            try {
                if (!req.params.ids || req.params.ids.length === 0) {
                    res.sendResponse({status: 400, error: new Error(`No IDs provided`), });
                    return;
                }

                const deleted = await collectionModel.destroy({
                    where: { id: req.params.ids || [] }
                });

                if (deleted) {
                    res.sendResponse({status: 204});
                } else {
                    res.sendError({status: 404, error: new Error(`${collectionName} not found`), });
                }
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });

        _APIGenericAssociations.initialize({
            app,
            appWithMeta,
            collectionName,
            collectionModel,
        });
    }
}

