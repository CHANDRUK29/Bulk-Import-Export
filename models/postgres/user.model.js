const db = require('../../db');
const { DataTypes } = require('sequelize');

const UserModel = db.pgConn.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING,
    validate: {
      len: [0, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    validate: {
      len: [0, 50]
    }
  },
  profilePicture: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATE
  },
  gender: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
})

module.exports = UserModel;