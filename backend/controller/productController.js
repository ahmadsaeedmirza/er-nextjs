const fs = require("fs");
const path = require("path");
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
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    cb(null, `${slug}-${Date.now()}-${randomSuffix}.jpg`);
  },
});

// 2. Multer Upload Middleware
const upload = multer({ storage: multerStorage });

// Middleware to process the image upload
exports.uploadProductPhoto = upload.fields([
  { name: "productImage", maxCount: 1 },
  { name: "additionalImages", maxCount: 10 },
]);

// Middleware to resize or add filename to body (The "Natours" style)
exports.addPhotoToBody = (req, res, next) => {
  if (req.files) {
    if (req.files.productImage && req.files.productImage[0]) {
      req.body.productImage = req.files.productImage[0].filename;
    }
    if (req.files.additionalImages) {
      req.body.additionalImages = req.files.additionalImages.map(
        (file) => file.filename
      );
    }
  }
  next();
};

exports.addProduct = factory.createOne(Product);
exports.getProduct = factory.getOne(Product);
exports.getAllProducts = factory.getAll(Product);

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("No product found with this ID", 404));
  }

  // Delete the main image file if it exists
  if (product.productImage) {
    const imagePath = path.join(__dirname, "..", "public", "images", "products", product.productImage);
    fs.unlink(imagePath, (err) => {
      if (err) console.error(`Failed to delete image: ${imagePath}`, err);
    });
  }

  // Delete all additional image files if they exist
  if (product.additionalImages && product.additionalImages.length > 0) {
    product.additionalImages.forEach((img) => {
      const imagePath = path.join(__dirname, "..", "public", "images", "products", img);
      fs.unlink(imagePath, (err) => {
        if (err) console.error(`Failed to delete additional image: ${imagePath}`, err);
      });
    });
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const oldProduct = await Product.findById(req.params.id);
  if (!oldProduct) {
    return next(new AppError("No document found with this ID", 404));
  }

  // 1) If a new main photo is uploaded, delete the old one
  if (req.files && req.files.productImage && req.files.productImage[0]) {
    if (oldProduct.productImage) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        "products",
        oldProduct.productImage
      );
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error(`Failed to delete old image: ${oldImagePath}`, err);
      });
    }
  }

  // 2) Manage additional images
  let keptImages = [];
  if (req.body.existingAdditionalImages) {
    try {
      keptImages = JSON.parse(req.body.existingAdditionalImages);
    } catch (e) {
      keptImages = req.body.existingAdditionalImages.split(",").filter(Boolean);
    }
  } else if (req.body.existingAdditionalImages === undefined) {
    // If the field wasn't sent at all, assume we keep all current ones
    keptImages = oldProduct.additionalImages || [];
  }

  // Delete additional images that were removed by the admin
  if (oldProduct.additionalImages && oldProduct.additionalImages.length > 0) {
    const removedImages = oldProduct.additionalImages.filter(
      (img) => !keptImages.includes(img)
    );
    removedImages.forEach((img) => {
      const imgPath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        "products",
        img
      );
      fs.unlink(imgPath, (err) => {
        if (err) console.error(`Failed to delete removed image: ${imgPath}`, err);
      });
    });
  }

  // Combine kept images with new ones
  const newAdditionalImages = req.body.additionalImages || [];
  req.body.additionalImages = [...keptImages, ...newAdditionalImages];

  // 3) Update the database record
  const doc = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

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
