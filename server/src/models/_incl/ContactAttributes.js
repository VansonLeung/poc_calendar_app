import Sequelize, { DataTypes } from "sequelize";

export const ContactAttributes = () => {
    return {
        firstName: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        lastName: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(32),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(1024),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(256),
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING(256),
            allowNull: true,
        },
        zip: {
            type: DataTypes.STRING(16),
            allowNull: true,
        },
    }
}
