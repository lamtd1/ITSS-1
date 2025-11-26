import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const SlideTag = sequelize.define('SlideTag', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'slide_tag_id'
  },
  slideId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'slide_id',
  },
  tagId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tag_id',
  }
}, {
  tableName: 'Slide_Tag',
  timestamps: false,
  freezeTableName: true
});

export default SlideTag;