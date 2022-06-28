const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require("../middleware/auth");

const productController = require('../controllers/productController')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.jpg' || ext !== '.png') {
            return cb(res.status(400).end('only jpg, png are allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file")

router.post("/uploadImage", auth, (req, res) => {

    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, image: res.req.file.path, fileName: res.req.file.filename })
    })

});

router.post("/uploadProduct", auth, async (req, res) => {
    const productDetail = req.body;

    try {
        await productController.addProduct(productDetail);
        return res.status(200).json({ success: true }) 
    }catch(e) {
        return res.status(400).json({ success: false, err })
    }
});

router.post("/getProducts", async (req, res) => {

    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);

    let findArgs = {};
    let term = req.body.searchTerm;

    for (let key in req.body.filters) {

        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
    
    try {
        const products = await productController.findProductsWithQuery(order, sortBy, limit, skip, findArgs, term)
        return res.status(200).json({ success: true, products, postSize: products.length })
    } catch(err) {
        return res.status(400).json({ success: false, err })
    }
});

//?id=${productId}&type=single
//id=12121212,121212,1212121 type=array 
router.get("/products_by_id", async (req, res) => {
    let type = req.query.type
    let productIds = req.query.id

    if (type === "array") {
        let ids = req.query.id.split(',');
        productIds = [];
        productIds = ids.map(item => {
            return item
        })
    }

    try {
        const product = await productController.findProductById(productIds)
        return res.status(200).send(product)
    } catch (err) {
        return res.status(400).send(err)
    }
});

module.exports = router;
