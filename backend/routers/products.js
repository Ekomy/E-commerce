const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let UploadError = new Error("Invalid image type");
    if (isValid) {
      UploadError = null;
    }
    cb(UploadError, "/public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter)
    .select("name image -_id")
    .populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    rating: req.body.rating,
    image: `${basePath}${fileName}`,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    countInStock: req.body.countInStock,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The Product can not be created!");

  res.send(product);
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product ID");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product!");

  const file = req.file;
  let imagepath;
  if (file) {
    basePath = `${req.protocol}://${req.get("host")}/public/uploads`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      brand: req.body.brand,
      category: req.body.category,
      rating: req.body.rating,
      image: req.body.image,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      countInStock: req.body.countInStock,
    },
    {
      new: true,
    }
  );

  if (!updatedProduct)
    return res.status(404).send("The Product cannot be created!");

  res.send(updatedProduct);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "The product not found!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count)
    .select("name image -_id")
    .populate("category");

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send(productCount);
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("image", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid Product ID");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.fileName}`);
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      {
        new: true,
      }
    );

    if (!product)
      return res.status(500).send("The Product can not be created!");

    res.send(product);
  }
);

module.exports = router;
