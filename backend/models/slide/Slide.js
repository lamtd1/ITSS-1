import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Slide = sequelize.define("Slide", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'slide_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'slide_title'
    },
    filepath: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'slide_file_path'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'slide_description'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'slide_created_at'
    }
}, {
    tableName: 'Slide',
    timestamps: true,
    createdAt: 'slide_created_at',
    updatedAt: false,
    freezeTableName: true
});

export default Slide;