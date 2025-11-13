import Sequelize, { DataTypes } from "sequelize";

export const ContentAttributes = () => {
    return {
        desc: DataTypes.TEXT,
        json: DataTypes.JSON,
        baseId: { 
            type: DataTypes.UUID,
            index: true,
        },
        langId: { 
            type: DataTypes.UUID,
            index: true,
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            index: true,
        },
        publishedAt: {
            type: DataTypes.DATE,
            index: true,
        },
        publishedBy: { 
            type: DataTypes.UUID,
            index: true,
        },
        revision: DataTypes.INTEGER,
    }
}
