const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Product must have a name"],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Product must have a description"],
    },
    price: {
      type: Number,
      required: [true, "Product must have a price"],
      min: [0, "Price can't be negative"],
    },
    productImage: {
      type: String,
      required: [true, "A product must have an image"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount can't be negative"],
      max: [100, "Discount can't exceed 100"],
    },
    slug: String,
    stockQuantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual("salePrice").get(function () {
  if (this.discount > 0) {
    return this.price - this.price * (this.discount / 100);
  }
  return this.price;
});

// GENERATE SLUG BEFORE SAVING
// productSchema.pre("save", function (next) {
//   if (!this.isModified("name")) return next();
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
});

// For PATCH / update
productSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
