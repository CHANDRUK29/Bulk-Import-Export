const UserModel = require("../../../models/postgres/user.model");


const addUser = async (payload) => {
  const data = await UserModel.create(payload);
  return data;
}

const getAllUser = async () => {
  const data = await UserModel.findAll({ limit: 20 })
  const details = data.map((val, index) => {
    const temp = Object.values(val.dataValues);
    // console.log("before",temp)
    temp[0] = index + 1;
    // console.log("after",temp)
    return temp;
  });
  return details;
}

const getUserByNameAndEmail = async (name, email) => {
  const data = await UserModel.findOne({ where: { name, email } });
  return data;
}

const updateUser = async (id, payload) => {
  const data = await UserModel.update(payload, { where: { id } });
  return data;
}

module.exports = {
  addUser,
  getAllUser,
  getUserByNameAndEmail,
  updateUser,
}