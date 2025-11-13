
export const SchemaToIndexes = (schema) => {
    const indexes = [];

    const aggregateIndexGroups = {};
    const aggregateUniqueGroups = {};

    for (var key in schema) {
        const attribute = schema[key] || {};
        
        const index = attribute.index;
        const indexGroups = attribute.indexGroups;
        const uniqueGroups = attribute.uniqueGroups;

        if (index) {
            indexes.push({
                fields: [`${key}`],
            })
        }

        if (indexGroups) {
            for (var k in indexGroups) {
                var indexGroupName = indexGroups[k].name;
                var indexGroupOrder = indexGroups[k].order;
                aggregateIndexGroups[indexGroupName] = aggregateIndexGroups[indexGroupName] || {};
                aggregateIndexGroups[indexGroupName][indexGroupOrder] = key;
            }
        }

        if (uniqueGroups) {
            for (var k in uniqueGroups) {
                var uniqueGroupName = uniqueGroups[k].name;
                var uniqueGroupOrder = uniqueGroups[k].order;
                aggregateUniqueGroups[uniqueGroupName] = aggregateUniqueGroups[uniqueGroupName] || {};
                aggregateUniqueGroups[uniqueGroupName][uniqueGroupOrder] = key;
            }
        }
    }

    if (Object.keys(aggregateIndexGroups).length > 0) {
        for (var indexGroupKey in aggregateIndexGroups) {
            const transformedArray = Object.keys(aggregateIndexGroups[indexGroupKey])
            .sort()
            .map(fieldKey => aggregateIndexGroups[indexGroupKey][fieldKey]);

            indexes.splice(0, 0, {
                fields: transformedArray,
            })
        }
    }

    if (Object.keys(aggregateUniqueGroups).length > 0) {
        for (var uniqueGroupKey in aggregateUniqueGroups) {
            const transformedArray = Object.keys(aggregateUniqueGroups[uniqueGroupKey])
            .sort()
            .map(fieldKey => aggregateUniqueGroups[uniqueGroupKey][fieldKey]);

            indexes.splice(0, 0, {
                unique: true,
                fields: transformedArray,
            })
        }
    }

    return indexes;
}
