const Product = require("../models/product");
const Seller = require("../models/seller");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const addProduct = async (req, res) => {
//     const product = new Product(req.body);
//     try {
//         await product.save();
//         res.status(201).json(product);
//         res.send('Product added successfully!');
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

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
      rating,
      reviews,
      quantity,
    });

    // Save the product to the database
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProductbyName = async (req, res) => {
  try {
    const product = await Product.findOne({ name: req.params.name });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sortProductsByRating = async (req, res) => {
  try {
    // Fetch products sorted by rating in descending order
    const products = await Product.find().sort({ rating: -1 }); // Use 1 for ascending order

    // Send the sorted products as a response
    res.status(200).json(products);
  } catch (error) {
    // Handle any errors
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  const { name, picture, price, description, quantity } = req.body; // Get details from request body

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

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterProductsByPrice = async (req, res) => {
  const { minPrice, maxPrice } = req.query;

  try {
    const products = await Product.find({
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    });

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProductbyName,
  sortProductsByRating,
  editProduct,
  filterProductsByPrice,
};
