const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
  // Method to compare the entered password with the hashed password in the database
  validPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'viewer', // Default role for new users
  },
}, {
  sequelize, // This is the connection instance
  modelName: 'User', // This is the name of the model
  tableName: 'Users', // Optional: this is the name of the table in the database (default is the model name in lowercase)
  timestamps: true, // Optional: this adds createdAt and updatedAt fields
});


module.exports = User;
