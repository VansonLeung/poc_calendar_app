import { Op } from 'sequelize';

export const recursiveMassageWhereClause = (whereClause) => {
    const keys = Object.keys(whereClause);
    for (var k in keys) {
        switch (keys[k]) {
            case "$like": whereClause[Op.like] = whereClause.$like; delete whereClause.$like; break;
            case "$gt": whereClause[Op.gt] = whereClause.$gt; delete whereClause.$gt; break;
            case "$lt": whereClause[Op.lt] = whereClause.$lt; delete whereClause.$lt; break;
            case "$gte": whereClause[Op.gte] = whereClause.$gte; delete whereClause.$gte; break;
            case "$lte": whereClause[Op.lte] = whereClause.$lte; delete whereClause.$lte; break;
            case "$in": whereClause[Op.in] = whereClause.$in; delete whereClause.$in; break;
            case "$not": whereClause[Op.not] = whereClause.$not; delete whereClause.$not; break;
            case "$ne": whereClause[Op.ne] = whereClause.$ne; delete whereClause.$ne; break;
            case "$notIn": whereClause[Op.notIn] = whereClause.$notIn; delete whereClause.$notIn; break;
            case "$notLike": whereClause[Op.notLike] = whereClause.$notLike; delete whereClause.$notLike; break;
            case "$iLike": whereClause[Op.iLike] = whereClause.$iLike; delete whereClause.$iLike; break;
            case "$notILike": whereClause[Op.notILike] = whereClause.$notILike; delete whereClause.$notILike; break;
            case "$eq": whereClause[Op.eq] = whereClause.$eq; delete whereClause.$eq; break;
            case "$contains": whereClause[Op.contains] = whereClause.$contains; delete whereClause.$contains; break;
            case "$all": whereClause[Op.all] = whereClause.$all; delete whereClause.$all; break;
            case "$and": whereClause[Op.and] = whereClause.$and; delete whereClause.$and; break;
            case "$or": whereClause[Op.or] = whereClause.$or; delete whereClause.$or; break;
            case "$regexp": whereClause[Op.regexp] = whereClause.$regexp; delete whereClause.$regexp; break;
            case "$notRegexp": whereClause[Op.notRegexp] = whereClause.$notRegexp; delete whereClause.$notRegexp; break;
            case "$iRegexp": whereClause[Op.iRegexp] = whereClause.$iRegexp; delete whereClause.$iRegexp; break;
            case "$notIRegexp": whereClause[Op.notIRegexp] = whereClause.$notIRegexp; delete whereClause.$notIRegexp; break;
        }
    }
    for (var k in whereClause) {
        const val = whereClause[k];
        if (val && typeof(val) === 'object') {
            recursiveMassageWhereClause(val);
        }
    }
}