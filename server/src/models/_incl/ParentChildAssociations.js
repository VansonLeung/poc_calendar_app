import Sequelize, { DataTypes } from "sequelize";
import { Settings } from "../_settings/index.js";

export const ParentChildAssociations = ({Me}) => {
    const MeParent = Me.belongsTo(Me, {
        as: 'parent',
        foreignKey: 'parentId',
        constraints: Settings.constraints,
    });
    const MeChilds = Me.hasMany(Me, {
        as: 'childs',
        foreignKey: 'parentId',
        constraints: Settings.constraints,
    });

    return {
        MeParent,
        MeChilds,
    }
}
