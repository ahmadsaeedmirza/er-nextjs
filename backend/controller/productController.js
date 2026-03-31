const multer = require("multer");
const Product = require("./../model/productModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./factoryFunctions");

// 1. Multer Storage Configuration
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/products/");
  },
  filename: (req, file, cb) => {
    const name = req.body.name || "product";
    const slug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^a-z0-9-]/g, "");
    cb(null, `${slug}.jpg`);
  },
});

// 2. Multer Upload Middleware
const upload = multer({ storage: multerStorage });

// Middleware to process the image upload
exports.uploadProductPhoto = upload.single("productImage");

// Middleware to resize or add filename to body (The "Natours" style)
exports.addPhotoToBody = (req, res, next) => {
  if (req.file) req.body.productImage = req.file.filename;
  next();
};

exports.addProduct = factory.createOne(Product);
exports.getProduct = factory.getOne(Product);
exports.getAllProducts = factory.getAll(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.updateProduct = factory.updateOne(Product);

exports.getProductBySlug = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isHidden: false,
  });

  if (!product) {
    return next(new AppError("No product found with this slug", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: product,
    },
  });
});

exports.updateProductVisibility = catchAsync(async (req, res, next) => {
  if (typeof req.body.isHidden !== "boolean") {
    return next(new AppError("Please provide isHidden as true or false", 400));
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isHidden: req.body.isHidden },
    { new: true, runValidators: true },
  );

  if (!product) {
    return next(new AppError("No document found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: product,
    },
  });
});
