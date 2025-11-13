import Sequelize, { DataTypes } from "sequelize";

export const ParentChildAttributes = () => {
    return {
        parentId: {
            type: DataTypes.UUID,
            index: true,
        },
    }
}
