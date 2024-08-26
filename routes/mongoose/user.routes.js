const router = require("express").Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage })

const userController = require("../../controllers/mongoose/user.controller");

router.post('/', userController.createUser);
router.get('/all', userController.allUsers);
router.post('/import', upload.single('file'), userController.importUser);
router.get('/export', userController.exportUser);

module.exports = router;