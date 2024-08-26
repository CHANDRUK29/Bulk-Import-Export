const path = require('path');
const fs = require("fs");
const logger = require("../../config/logger.config");
const xlsx = require('xlsx');
const userContext = require('../../db/context/mongoose/user.context');
const User = require("../../models/mongoose/user.model");

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(422).json({ message: "name or email is missing" })
    let create = await userContext.addUser(req.body)
    if (!create) return res.status(400).json({ message: "unable to create user something went wrong" })
    return res.status(200).json({ message: "user created successfully", data: create })
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error: error.message })
  }
}

const allUsers = async (req, res) => {
  try {
    const data = await userContext.getAllUser();
    return res.status(200).json({ message: "all users fetched successfully", data });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error: error.message })
  }
}

const importUser = async (req, res) => {
  try {
    console.log(req.file)
    if (!req.file) return res.status(400).json({ message: "file is missing" });
    const excelBuffer = req.file.buffer;
    const workBook = xlsx.read(excelBuffer, { type: 'buffer' });

    if (!workBook.SheetNames || workBook.SheetNames.length == 0) return res.status(400).json({ message: 'excel sheet is empty' });

    const sheetName = workBook.SheetNames[0];
    console.time('Reading json')
    const jsonData = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName]);
    console.timeEnd('Reading json')
    if (jsonData.length == 0) return res.status(400).json({ message: 'Excel sheet does not contain any data' })

    console.time('Uplading datas')
    for (let i = 0; i < jsonData.length; i++) {
      let { name, email, firstName, lastName, profilePicture, dateOfBirth, gender } = jsonData[i];

      const existingUser = await userContext.getUserByNameAndEmail(name, email);
      if (existingUser) {
        await userContext.updateUser(existingUser._id, { firstName, lastName, profilePicture, dateOfBirth, gender })
      } else {
        await userContext.addUser({ name, email, firstName, lastName, profilePicture, dateOfBirth, gender })
      }
    }
    console.timeEnd('Uplading datas')
    return res.status(200).json({ message: "data uploaded successfully" })
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error: error.message })
  }
}

const exportUser = async (req, res) => {
  try {
    // console.log(Object.keys(User.schema.obj));
    const xlsxData = [
      [
        'S.No',
        ...Object.keys(User.schema.obj)

      ]
    ]
    console.time('export...')
    const jsonData = await userContext.getAllUser();
    xlsxData.push(...jsonData);
    //creating work sheet
    const workSheet = xlsx.utils.aoa_to_sheet(xlsxData);
    //and creating workbook for worksheet
    const workBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheet, 'sheet1');

    // creating a filepath to store excel
    const filePath = path.join(process.cwd(), 'mongooseUser.xlsx');
    // writing the datas in excel
    xlsx.writeFile(workBook, filePath);
    console.timeEnd('export...')
    return res.status(200).download(filePath, (err) => {
      if (err) return err;
      // removing the created excel file to reduce the server load
      fs.unlink(filePath, (error) => {
        if (error) logger.error('unable to delete file')
        logger.info('file deleted successfully');
      })
    })
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error: error.message })
  }
}
module.exports = {
  createUser,
  allUsers,
  importUser,
  exportUser,
}