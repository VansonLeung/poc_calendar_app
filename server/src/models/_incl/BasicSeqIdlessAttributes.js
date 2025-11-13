import Sequelize, { DataTypes } from "sequelize";

export const BasicSeqIdlessAttributes = () => {
    return {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        seq: {
            type: DataTypes.INTEGER,
            index: true,
        },
        name: DataTypes.STRING(256),
    }
}

