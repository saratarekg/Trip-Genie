const Product = require("../models/product");
const Seller = require("../models/seller");

const getAllProducts = async (req, res) => {
  const { minPrice, budget, searchBy, asc, myProducts } = req.query;

  try {
    // Debugging: Log incoming query parameters
    console.log("Received query:", req.query);

    // Build the query object dynamically
    const query = {};

    // Apply search filter (by name) if provided
    if (searchBy) {
      query.name = { $regex: searchBy, $options: "i" }; // Case-insensitive regex search
      console.log("Search applied:", query.name);
    }

    // Apply price range filter if provided
    if (minPrice || budget) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice); // Apply minPrice if given
      if (budget) query.price.$lte = parseFloat(budget); // Apply budget if given
      console.log("Price filter applied:", query.price); // Log the price filter
    }

    // Filter by the user's products (myProducts)
    if (myProducts) {
      query.seller = res.locals.user_id;
      console.log("Filtering by user's products:", query.seller);
    }

    // Perform the query
    let productsQuery = Product.find(query);

    // Apply sorting if 'asc' is defined (for sorting by rating)
    if (asc !== undefined) {
      const sortOrder = parseInt(asc, 10);
      productsQuery = productsQuery.sort({ rating: sortOrder });
      console.log("Sorting applied:", { rating: sortOrder });
    }

    // Execute the query and get the products
    const products = await productsQuery;

    // Check if no products match the filters
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    // Return filtered products
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProduct = async (req, res) => {
  const { name, picture, price, description, rating, reviews, quantity } =
    req.body; // Extract the data from request

  try {
    // Use the sellerType from the Seller document
    //   const sellerType = seller.seller;

    // Create the product with the fetched sellerType
    const product = new Product({
      name,
      picture,
      price,
      description,
      seller: res.locals.user_id,
      quantity,
    });

    // Save the product to the database
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addProductByAdmin = async (req, res) => {
  const { name, picture, price, description, rating, reviews, quantity } =
    req.body; // Extract the data from request

  try {
    // Use the sellerType from the Seller document
    //   const sellerType = seller.seller;

    // Create the product with the fetched sellerType
    const product = new Product({
      name,
      picture,
      price,
      description,
      quantity,
    });

    // Save the product to the database
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  const { name, picture, price, description, quantity, reviews } = req.body; // Get details from request body
  try {
    // Find the product by ID and update its details
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, picture, price, description, quantity, reviews },
      { new: true, runValidators: true } // Options: return the updated document and run validation
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findById(id);
    const totalRating = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    const newRating = totalRating / product.reviews.length;
    updatedProduct.rating = await Product.findByIdAndUpdate(productId, {
      $set: { rating: newRating },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editProductOfSeller = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  const { name, picture, price, description, quantity } = req.body; // Get details from request body
  const product = await Product.findById(id);
  if (product.seller.toString() != res.locals.user_id) {
    return res
      .status(403)
      .json({ message: "You are not authorized to edit this product" });
  }
  try {
    // Find the product by ID and update its details
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, picture, price, description, quantity },
      { new: true, runValidators: true } // Options: return the updated document and run validation
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findById(id);
    const totalRating = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    const newRating = totalRating / product.reviews.length;
    console.log(newRating);
    const newProduct = await Product.findByIdAndUpdate(
      id,
      { rating: newRating },
      { new: true, runValidators: true }
    );

    res.status(200).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id)
    .populate("seller")
      .exec();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProductOfSeller = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (product.seller.toString() != res.locals.user_id) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this product" });
  }
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  editProduct,
  editProductOfSeller,
  getProductById,
  deleteProduct,
  deleteProductOfSeller,
  addProductByAdmin
};
