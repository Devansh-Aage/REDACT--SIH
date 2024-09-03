const multer = require("multer");
const express = require("express");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const encryptFile = (buffer, key) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, key.slice(0, 16));
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted;
  };

router.post("/upload", upload.single("orgFile"), (req, res) => {
  console.log(req.body);
  console.log(req.file);

  return res.json({ message: "File uploaded successfully" });
});

module.exports = router;
