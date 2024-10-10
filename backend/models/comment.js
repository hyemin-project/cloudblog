const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path if necessary

class Comment extends Model {}

Comment.init({
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'Comments',
  timestamps: true,
});

module.exports = Comment;
