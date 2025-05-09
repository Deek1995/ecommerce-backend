const { Router } = require("express");
const Products = require("../controllers/Products.controller");
const router = Router();

router.get("/", Products.getAllProducts);
router.get("/product/:id", Products.getSingleProduct);
module.exports = router;
