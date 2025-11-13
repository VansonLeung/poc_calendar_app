import Sequelize, { DataTypes } from "sequelize";

export const CodeAttributes = ({length = 64} = {}) => {
    return {
        code: {
            type: DataTypes.STRING(length),
            allowNull: true,
            unique: true,
        },
    }
}

