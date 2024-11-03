const Product = require("../models/product");
const Seller = require("../models/seller");
const Tourist = require("../models/tourist");

const getAllProducts = async (req, res) => {
  const { minPrice, maxPrice, searchBy, asc, myproducts } = req.query;

  try {
    // Debugging: Log incoming query parameters

    // Build the query object dynamically
    const query = {};

    // Apply search filter (by name) if provided
    if (searchBy) {
      query.name = { $regex: searchBy, $options: "i" }; // Case-insensitive regex search
    }

    // Apply price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
    }
    if (minPrice) query.price.$gte = parseFloat(minPrice); // Apply minPrice if given
    if (maxPrice) query.price.$lte = parseFloat(maxPrice); // Apply maxPrice if given}

    // Filter by the user's products (myProducts)
    if (myproducts) {
      query.seller = null;
    }

    // Perform the query
    query.isArchived = false;
    let productsQuery = Product.find(query);

    // Apply sorting if 'asc' is defined (for sorting by rating)
    if (asc !== undefined) {
      const sortOrder = parseInt(asc, 10);
      productsQuery = productsQuery.sort({ rating: sortOrder });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    // Execute the query and get the products
    const products = await productsQuery;

    // Check if no products match the filters
    if (!products.length) {
      return res.status(200).json([]);
    }

    // Return filtered products
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProductsArchive = async (req, res) => {
  const { minPrice, maxPrice, searchBy, asc, myproducts } = req.query;

  try {
    // Debugging: Log incoming query parameters

    // Build the query object dynamically
    const query = {};

    // Apply search filter (by name) if provided
    if (searchBy) {
      query.name = { $regex: searchBy, $options: "i" }; // Case-insensitive regex search
    }

    // Apply price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice); // Apply minPrice if given
      if (maxPrice) query.price.$lte = parseFloat(maxPrice); // Apply maxPrice if given
    }

    // Filter by the user's products (myProducts)
    if (myproducts) {
      query.seller = res.locals.user_id;
    }

    // Perform the query
    query.isArchived = true;
    let productsQuery = Product.find(query);

    // Apply sorting if 'asc' is defined (for sorting by rating)
    if (asc !== undefined) {
      const sortOrder = parseInt(asc, 10);
      productsQuery = productsQuery.sort({ rating: sortOrder });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    // Execute the query and get the products
    const products = await productsQuery;

    // Check if no products match the filters
    if (!products.length) {
      return res.status(200).json([]);
    }

    // Return filtered products
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProduct = async (req, res) => {
  const { name, price, description, quantity, currency } = req.body; // Extract the data from request

  try {
    const pictures = req.files.map(
      (file) => `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );

    const product = new Product({
      name,
      pictures,
      price,
      description,
      seller: res.locals.user_id,
      quantity,
      currency,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addProductByAdmin = async (req, res) => {
  const {
    name,
    pictures,
    price,
    description,
    rating,
    reviews,
    quantity,
    currency,
  } = req.body; // Extract the data from request

  try {
    const pictures = req.files.map(
      (file) => `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );
    const product = new Product({
      name,
      pictures,
      price,
      description,
      quantity,
      currency,
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
  const { name, price, description, quantity, reviews } = req.body; // Get details from request body
  console.log(reviews);
  let pictures = req.body; // Get details from request body
  try {
    pictures = req.files.map(
      // Convert the uploaded files to base64 strings
      (file) => `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );
    // Find the product by ID and update its details
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, pictures, price, description, quantity, reviews, currency },
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

    if (product.reviews.length > 0) {
      const newRating = totalRating / product.reviews.length;
      updatedProduct.rating = await Product.findByIdAndUpdate(id, {
        $set: { rating: newRating },
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editProductOfSeller = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  const { name, price, description, quantity, currency } = req.body;
  let pictures = req.body; // Get details from request body
  const product = await Product.findById(id);
  if (product.seller.toString() != res.locals.user_id) {
    return res
      .status(403)
      .json({ message: "You are not authorized to edit this product" });
  }
  try {
    // Find the product by ID and update its details
    pictures = req.files.map(
      // Convert the uploaded files to base64 strings
      (file) => `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, pictures, price, description, quantity, currency },
      { new: true, runValidators: true } // Options: return the updated document and run validation
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let product = await Product.findById(id);
    const totalRating = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );

    if (product.reviews.length > 0) {
      const newRating = totalRating / product.reviews.length;
      product = await Product.findByIdAndUpdate(
        id,
        { rating: newRating },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("seller").exec();
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

const archiveProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isArchived: !product.isArchived },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      product: updatedProduct,
      message: "Product archived status toggled successfully",
    });
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

const addProductToCart = async (req, res) => {
  const { productId, quantity } = req.body; // Extract productId and quantity from request body
  const userId = res.locals.user_id; // Assuming the logged-in user ID is stored in res.locals

  try {
    // Find the user (tourist)
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Check if the product already exists in the cart
    const existingCartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingCartItem) {
      // If product is already in the cart, update the quantity and totalPrice
      await Tourist.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "cart.$[elem].quantity": quantity, // Increment the quantity of the existing product
            "cart.$[elem].totalPrice": quantity * product.price, // Update the totalPrice for the product
          },
        },
        {
          arrayFilters: [{ "elem.product": productId }], // Find the product in the cart using arrayFilters
          new: true, // Return the updated document
        }
      );
    } else {
      // If product is not in the cart, add it to the cart array
      await Tourist.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: {
              product: productId,
              quantity,
              totalPrice: quantity * product.price,
            },
          },
        },
        { new: true } // Return the updated document
      );
    }

    // Find the updated user data with the cart to return the updated cart
    const updatedUser = await Tourist.findById(userId);
    res
      .status(200)
      .json({ message: "Product added to cart", cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product to the wishlist
const addProductToWishlist = async (req, res) => {
  const productId = req.params.id; // Extract productId from the request params
  const userId = res.locals.user_id; // Assuming the logged-in user ID is stored in res.locals

  try {
    // Find the user (tourist)
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Check if the product already exists in the wishlist
    const existingWishlistItem = user.wishlist.find((item) => {
      console.log(
        "Checking product:",
        item.product._id.toString(),
        "against",
        productId
      ); // Log each iteration
      return item.product._id.toString() === productId;
    });

    if (existingWishlistItem) {
    } else {
      // If the product is not already in the wishlist, add it to the wishlist
      await Tourist.findByIdAndUpdate(
        userId,
        {
          $push: {
            wishlist: { product: productId },
          },
        },
        { new: true } // Return the updated document
      );

      // Fetch the updated user data with the wishlist
      const updatedUser = await Tourist.findById(userId);
    }
    res.status(200).json({
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Error: ", error); // Log the full error to the console
    res.status(500).json({ message: error.message });
  }
};

const rateProduct = async (req, res) => {
  try {
    const { rating } = req.body; // Get rating from the request body
    const product = await Product.findById(req.params.id); // Find the product by ID

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 0 and 5" });
    }

    // Add the new rating to the allRatings array
    product.allRatings.push(rating);

    // Calculate the new average rating
    const totalRatings = product.allRatings.reduce(
      (sum, rating) => sum + rating,
      0
    );
    const newAverageRating = totalRatings / product.allRatings.length;

    // Update the product's overall rating
    product.rating = newAverageRating;

    // Save the updated product
    await product.save();

    res.status(200).json({ message: "Rating added", newAverageRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment (and optional rating) to a product
const addCommentToProduct = async (req, res) => {
  try {
    const { rating, comment } = req.body; // Get comment details from the request body

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    const userId = res.locals.user_id; // Get user ID from locals (assuming user is authenticated)

    const tourist = await Tourist.findById(userId);

    if (!tourist) {
      return res.status(404).json({ message: "User not found" });
    }
    const product = await Product.findById(req.params.id); // Find the product by ID

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Create the new review object
    const newReview = {
      user: tourist.username || "Anonymous", // Use 'Anonymous' if no username is provided
      rating: rating || 0,
      comment,
      date: new Date(),
    };

    // Add the review to the product's reviews array
    product.reviews.push(newReview);

    // If the comment includes a rating, add the rating and recalculate the average rating
    let newAverageRating;
    if (rating !== undefined) {
      product.allRatings.push(rating);
      const totalRatings = product.allRatings.reduce(
        (sum, rating) => sum + rating,
        0
      );
      newAverageRating = totalRatings / product.allRatings.length;
      product.rating = newAverageRating;
    }

    // Save the updated product
    await product.save();

    // Return the updated reviews and new average rating (if applicable)
    res.status(200).json({
      message: "Comment added successfully",
      reviews: product.reviews,
      ...(newAverageRating && { newAverageRating }), // Only include the new rating if it was updated
    });
  } catch (error) {
    console.error("Error: ", error.message); // Print the error message to the console
    return res.status(500).json({ error: error.message }); // Return the error message in the response
  }
};

module.exports = {
  rateProduct,
  addCommentToProduct,
  addProductToCart,
  addProductToWishlist,
  getAllProducts,
  addProduct,
  editProduct,
  editProductOfSeller,
  getProductById,
  deleteProduct,
  deleteProductOfSeller,
  addProductByAdmin,
  archiveProduct,
  getAllProductsArchive,
};
