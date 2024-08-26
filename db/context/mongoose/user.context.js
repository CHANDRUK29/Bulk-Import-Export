const User = require("../../../models/mongoose/user.model");


const addUser = async (payload) => {
  const data = await User.create(payload);
  return data;
}

const getAllUser = async () => {
  const data = await User.find({}).select(['-_id', 'name', 'email', 'firstName', 'lastName', 'profilePicture', 'dateOfBirth', 'gender']);
  const details = data.map((val, index) => {
    let obj = { 'S.No': index + 1, ...val.toJSON() }
    return Object.values(obj)
  });
  return details;
}

const getUserByNameAndEmail = async (name, email) => {
  const data = await User.findOne({ name, email });
  return data;
}

const updateUser = async (id, payload) => {
  const data = await User.findByIdAndUpdate(id, payload);
  return data;
}

module.exports = {
  addUser,
  getAllUser,
  getUserByNameAndEmail,
  updateUser,
}