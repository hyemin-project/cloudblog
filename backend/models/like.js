const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path if necessary

class Like extends Model {}

Like.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Comments',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Like',
  tableName: 'Likes',
  timestamps: true,
});

module.exports = Like;
