import Sequelize, { DataTypes } from "sequelize";

export const BasicAttributes = () => {
    return {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        seqId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
        },
        seq: {
            type: DataTypes.INTEGER,
            index: true,
        },
        name: DataTypes.STRING(256),
    }
}

