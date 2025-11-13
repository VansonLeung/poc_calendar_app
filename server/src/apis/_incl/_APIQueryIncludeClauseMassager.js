import { Op } from 'sequelize';
import { recursiveMassageWhereClause } from './_APIQueryWhereClauseMassager.js';

export const recursiveMassageIncludeClause = (includeClause) => {
    if (includeClause) {
        for (var k in includeClause) {
            const bundle = includeClause[k];
            
            const {
                include,
                where,
            } = bundle || {};

            if (where) {
                recursiveMassageWhereClause(where);
            }

            if (include) {
                recursiveMassageIncludeClause(include);
            }
        }
    }
}