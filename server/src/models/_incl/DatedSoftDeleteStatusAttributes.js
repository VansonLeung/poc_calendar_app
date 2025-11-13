import Sequelize, { DataTypes } from "sequelize";

export const DatedSoftDeleteStatusAttributes = () => {
    return {
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            index: true,
        },
        isDisabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            index: true,
        },
        deletedAt: DataTypes.DATE,
        deletedBy: { 
            type: DataTypes.UUID,
            index: true,
        },
    }
}
