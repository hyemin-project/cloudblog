module.exports = (sequelize, DataTypes) => {
    const Analytics = sequelize.define('Analytics', {
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    });
  
    return Analytics;
  };
  