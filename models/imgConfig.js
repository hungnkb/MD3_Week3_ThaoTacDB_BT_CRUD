const multer = require('multer');
const imageModel = require('../models/image-model');

class displayImg {

    displayImg = async (req, res) => {
        imageModel.displayImg(data => {
            res.render('display-image', { imagePath: data });
        })
    }
}

module.exports = displayImg;
