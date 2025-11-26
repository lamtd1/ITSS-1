import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'tag_id'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'tag_name'
    }
}, {
    tableName: 'Tag',
    timestamps: false,
    freezeTableName: true
});

export default Tag;