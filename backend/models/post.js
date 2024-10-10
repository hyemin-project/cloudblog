const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Post extends Model {}

Post.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  readCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status :{
    type: DataTypes.ENUM('Draft', 'Published', 'Scheduled'),
    allowNull: false,
    defaultValue: 'Draft', 
  },
  scheduledPublishDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
}, {
  sequelize,
  modelName: 'Post',
  tableName: 'Posts',
  timestamps: true,
});

module.exports = Post;
