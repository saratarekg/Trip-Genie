const express = require("express");
const router = express.Router();
const nationalityController = require("../controllers/nationalityController");
const tagController = require("../controllers/tagController");
const categoryController = require("../controllers/categoryController");
const historicaltagController = require("../controllers/historicalTagController");
const { getAllLanguages } = require("../controllers/itineraryController");

router.get("/nationalities", nationalityController.getAllNationalities);
router.get("/getAllTypes", tagController.getAllTypes);
router.get("/getAllTags", tagController.getAlltags);
router.get("/getAllCategories", categoryController.getAllCategories);
router.get(
  "/getAllHistoricalTypes",
  historicaltagController.getAllHistoricalTypes
);


router.get("/getAllLanguages", getAllLanguages);


// router.post('/create-checkout-session', async (req, res) => {
//   try {
//     const { items, currency } = req.body;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: items.map(item => ({
//         price_data: {
//           currency: currency,
//           product_data: {
//             name: item.product.name,
//           },
//           unit_amount: Math.round(item.totalPrice * 100), 
//         },
//         quantity: item.quantity,
//       })),
//       mode: 'payment',
//       success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/checkout`,
//     });

//     console.log('Checkout session created:', session.id);
//     res.json({ id: session.id });
//   } catch (error) {
//     console.error('Error creating checkout session:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
