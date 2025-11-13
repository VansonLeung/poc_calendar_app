import Sequelize, { DataTypes } from "sequelize";

export const DatedStatusAttributes = () => {
    return {
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            index: true,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            index: true,
        },
        createdBy: { 
            type: DataTypes.UUID,
            index: true,
        },
        updatedBy: { 
            type: DataTypes.UUID,
            index: true,
        },
    }
}
