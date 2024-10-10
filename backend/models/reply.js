const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reply = sequelize.define('Reply', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Comments', // References the `Comment` model
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Assuming there’s a User model and users can reply
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

module.exports = Reply;
