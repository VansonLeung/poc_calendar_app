import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicAttributes,
    DatedStatusAttributes,
} from "../_incl/index.js";

export const EBShopOwnerMapping = {
    makeAssociations: ({Me, Shop, User}) => {
        Shop.belongsToMany(User, { 
            through: Me,
            as: 'users',
            foreignKey: 'shopId',
            constraints: Settings.constraints,
        });
        User.belongsToMany(Shop, { 
            through: Me,
            as: 'shops',
            foreignKey: 'userId',
            constraints: Settings.constraints,
        });
    },

    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...DatedStatusAttributes(),
            shopId: DataTypes.UUID,
            userId: DataTypes.UUID,
        }
    },
}
