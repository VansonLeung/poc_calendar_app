import Sequelize, { DataTypes } from "sequelize";
import { Settings } from "../_settings/index.js";

export const ContentAssociations = ({Me, Lang}) => {
    const MeBase = Me.belongsTo(Me, {
        as: 'base',
        foreignKey: 'baseId',
        constraints: Settings.constraints,
    });
    
    const MeDerivatives = Me.hasMany(Me, {
        as: 'derivatives',
        foreignKey: 'baseId',
        constraints: Settings.constraints,
    });

    const MeLang = Me.belongsTo(Lang, {
        foreignKey: 'langId',
        as: 'lang',
        constraints: Settings.constraints,
    });
    
    return {
        MeBase,
        MeDerivatives,
        MeLang,
    }
}
