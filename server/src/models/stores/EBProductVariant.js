import Sequelize, { DataTypes } from "sequelize"
import { Settings } from "../_settings/index.js";
import { 
    BasicAttributes, 
    CodeAttributes, 
    ContentAssociations, 
    ContentAttributes, 
    DatedSoftDeleteStatusAttributes, 
    DatedStatusAttributes, 
    ProductVariantAssociations, 
    ProductVariantAttributes,
} from "../_incl/index.js";

export const EBProductVariant = {
    makeAssociations: ({Me, Lang, Product}) => {
        CodeAttributes();
        ContentAssociations({ Me, Lang });
        ProductVariantAssociations({ Me, Product, });
    },

    makeSchema: () => {
        return {
            ...BasicAttributes(),
            ...DatedStatusAttributes(),
            ...DatedSoftDeleteStatusAttributes(),
            ...ContentAttributes(),
            ...ProductVariantAttributes(),
        }
    },
};

