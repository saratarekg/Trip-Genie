import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "../components/Loader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";
import { UserGuide } from "@/components/UserGuide";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Star,
  Flame,
  Edit,
  Trash2,
  Link,
  Share2,
  TrendingUp,
  Mail,
  Phone,
  User,
  StarHalf,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  CreditCard,
  Coins,
  Info,
  StoreIcon,
  CircleUserRound,
  Heart,
  ShoppingCart,
  Wallet,
  MessageSquare,
  XCircleIcon,
  Archive,
  ArchiveX,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
const userCluster = localStorage.getItem("cluster");

const RatingDistributionBar = ({ percentage, count }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="w-8 text-right">{count} ★</span>
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#1A3B47] rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="w-12 text-gray-500">{percentage}%</span>
  </div>
);

const StarRating = ({ rating, onRatingChange = null }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-[#F88C33] fill-current" : "text-gray-300"
          } ${onRatingChange ? "cursor-pointer" : ""}`}
          onClick={() => onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
};

const ImageGallery = ({ pictures }) => {
  const [mainImage, setMainImage] = useState(pictures[0]?.url);
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    setStartIndex((prevIndex) => Math.min(pictures.length - 5, prevIndex + 1));
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Thumbnail Column */}
      <div className="w-1/5 relative">
        <div className="h-full overflow-hidden relative">
          {pictures.length > 5 && (
            <button
              onClick={handlePrev}
              className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-opacity-50 text-white p-1 rounded-full z-10 ${
                startIndex === 0 ? "bg-gray-400" : "bg-black"
              }`}
              disabled={startIndex === 0}
              aria-label="Previous images"
            >
              <ChevronUp size={20} />
            </button>
          )}
          <div className="flex flex-col gap-2 h-full transition-transform duration-700 ease-in-out">
            {pictures.slice(startIndex, startIndex + 5).map((pic, index) => (
              <img
                key={startIndex + index}
                src={pic.url}
                alt={`Product image ${startIndex + index + 1}`}
                className="w-full h-[20%] object-cover rounded-lg cursor-pointer"
                onClick={() => setMainImage(pic.url)}
                style={{ transition: "transform 0.7s ease-in-out" }}
              />
            ))}
          </div>
          {pictures.length > 5 && (
            <button
              onClick={handleNext}
              className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-opacity-50 text-white p-1 rounded-full z-10 ${
                startIndex >= pictures.length - 5 ? "bg-gray-400" : "bg-black"
              }`}
              disabled={startIndex >= pictures.length - 5}
              aria-label="Next images"
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Image Column */}
      <div className="w-4/5 h-full">
        <div className="h-full flex items-center justify-center">
          <img
            src={mainImage}
            alt="Main product image"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get("role") || "guest");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  //const [showArchiveSuccess, setShowArchiveSuccess] = useState(false);
  const [archiveError, setArchiveError] = useState(null);
  const [canModify, setCanModify] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("");
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filteredRating, setFilteredRating] = useState(0);
  const [streetName, setStreetName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [floorUnit, setFloorUnit] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [showMore, setShowMore] = useState(false);
  const characterLimit = 150; // Set your desired character limit
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState({});
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [userReview, setUserReview] = useState(null);
  const [quickRating, setQuickRating] = useState(0);
  const [isRatingHovered, setIsRatingHovered] = useState(false);
  const [isExpandedComment, setIsExpandedComment] = useState(false);
  const [open, setOpen] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const handleToggleComment = () => {
    setIsExpandedComment(!isExpandedComment);
  };

  const [filteredReviews, setFilteredReviews] = useState(null);
  // Handle filtering reviews based on selected star rating
  const handleFilterRating = (rating, product) => {
    setFilteredRating(rating);
    // If rating is 0, show all reviews; otherwise, filter by the selected rating
    if (rating === 0) {
      setFilteredReviews(product.reviews);
    } else {
      setFilteredReviews(
        product.reviews.filter((review) => review.rating === rating)
      );
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsToastOpen(true);
    setOpen(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      `Check out this product: ${product.name}`
    );
    const body = encodeURIComponent(
      `I thought you might be interested in this product:\n\n${product.name}\n\n${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false); // Close the popover
  };

  const fetchExchangeRate = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `https://trip-genie-apis.vercel.app/${userRole}/populate`,
        {
          method: "POST",
   
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Ensure content type is set to JSON
          },
          body: JSON.stringify({
            base: product.currency, // Sending base currency ID
            target: userPreferredCurrency._id, // Sending target currency ID
          }),
        }
      );
      // Parse the response JSON
      const data = await response.json();

      if (response.ok) {
        setExchangeRates(data.conversion_rate);
      } else {
        // Handle possible errors
        console.error("Error in fetching exchange rate:", data.message);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  const getCurrencySymbol = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `https://trip-genie-apis.vercel.app/${userRole}/getCurrency/${product.currency}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrencySymbol(response.data);
    } catch (error) {
      console.error("Error fetching currensy symbol:", error);
    }
  };

  const formatPrice = (price, type) => {
    const roundedPrice = price;
    if (product) {
      if (userRole === "tourist" && userPreferredCurrency) {
        if (userPreferredCurrency === product.currency) {
          return `${userPreferredCurrency.symbol}${roundedPrice}`;
        } else {
          const exchangedPrice = (roundedPrice * exchangeRates).toFixed(2);
          return `${userPreferredCurrency.symbol}${exchangedPrice}`;
        }
      } else {
        if (currencySymbol) {
          return `${currencySymbol.symbol}${roundedPrice}`;
        }
      }
    }
  };

  const fetchUserInfo = async () => {
    const role = Cookies.get("role") || "guest";
    setUserRole(role);

    if (role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get(
          "https://trip-genie-apis.vercel.app/tourist/",
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const currencyId = response.data.preferredCurrency;

        const response2 = await axios.get(
          `https://trip-genie-apis.vercel.app/tourist/getCurrency/${currencyId}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserPreferredCurrency(response2.data);
        if (response.data.wishlist) {
          const wishlistIds = response.data.wishlist.map((item) =>
            item.product.toString()
          );
          console.log(wishlistIds);
          console.log(id.toString());
          setIsWishlisted(wishlistIds.includes(id.toString()));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  useEffect(() => {
    if (product) {
      if (
        userRole === "tourist" &&
        userPreferredCurrency &&
        userPreferredCurrency !== product.currency
      ) {
        fetchExchangeRate();
      } else {
        getCurrencySymbol();
      }
    }
  }, [userRole, userPreferredCurrency, product]);

  const handleViewMore = () => {
    setShowMore(!showMore);
  };

  const resetFields = () => {
    setPaymentMethod("");
    setDeliveryDate("");
    setDeliveryTime("");
    setDeliveryType("");
    setStreetName("");
    setStreetNumber("");
    setFloorUnit("");
    setState("");
    setCity("");
    setPostalCode("");
    setLandmark("");
    setLocationType("");
  };

  const calculateDeliveryCost = (type) => {
    switch (type) {
      case "Standard":
        return 2.99; // Standard delivery cost
      case "Express":
        return 4.99; // Express delivery cost
      case "Next-Same":
        return 6.99; // Next/Same Day delivery cost
      case "International":
        return 14.99; // International delivery cost
      default:
        return 0; // No additional cost
    }
  };

  const updateLocation = () => {
    const fullLocation = `
      Street Name: ${streetName || ""}, 
      Street Number: ${streetNumber || ""}, 
      ${floorUnit ? `Floor/Unit: ${floorUnit},` : ""}
      State: ${state || ""}, 
      City: ${city || ""}, 
      Postal Code: ${postalCode || ""} 
      ${landmark ? `, Landmark: ${landmark}` : ""}
    `.trim();

    setLocation(fullLocation);
  };

  // Handlers for each input that update both the field and the location
  const handleStreetNameChange = (e) => {
    setStreetName(e.target.value);
    updateLocation();
  };

  const handleStreetNumberChange = (e) => {
    setStreetNumber(e.target.value);
    updateLocation();
  };

  const handleFloorUnitChange = (e) => {
    setFloorUnit(e.target.value);
    updateLocation();
  };

  const handleStateChange = (e) => {
    setState(e.target.value);
    updateLocation();
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    updateLocation();
  };

  const handlePostalCodeChange = (e) => {
    setPostalCode(e.target.value);
    updateLocation();
  };

  const handleLandmarkChange = (e) => {
    setLandmark(e.target.value);
    updateLocation();
  };

  // Function to toggle between expanded and collapsed states
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(
          `https://trip-genie-apis.vercel.app/${userRole}/products/${id}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const data = await response.json();
        setProduct(data);
        setError(null);

        if (token) {
          const decodedToken = jwtDecode(token);
          if (data.seller === undefined) {
            setCanModify(true);
          } else {
            setCanModify(decodedToken.id === data.seller._id);
          }
        }

        if (data) {
          setFilteredReviews(data.reviews);
          setProduct(data);
          // Calculate rating distribution
          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          data.reviews.forEach((review) => {
            distribution[Math.floor(review.rating)] =
              (distribution[Math.floor(review.rating)] || 0) + 1;
          });
          setRatingDistribution(distribution);

          // Find user's review if exists
          const token = Cookies.get("jwt");
          if (token) {
            const decodedToken = jwtDecode(token);
            const userReview = data.reviews.find(
              (review) => review.tourist?._id === decodedToken.id
            );
            if (userReview) {
              console.log(userReview);
              setUserReview(userReview);
              setQuickRating(userReview.rating || 0);
              setRating(userReview.rating || 0);
              setComment(userReview.comment || "");
              setIsAnonymous(
                !(userReview?.user === userReview.tourist.username)
              );
            }
          }
        }

        // Fetch user's purchases
        const purchasesResponse = await fetch(
          "https://trip-genie-apis.vercel.app/tourist/purchase",
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (purchasesResponse.ok) {
          const purchasesData = await purchasesResponse.json();

          setHasPurchased(
            purchasesData.some((purchase) =>
              purchase.products.some(
                (item) => item.product && item.product._id === id
              )
            )
          );
        }
      } catch (err) {
        setError("Error fetching product details. Please try again later.");
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
    fetchProductDetails();
  }, [id, userRole]);

  const handleUpdate = () => {
    navigate(`/update-product/${id}`);
  };

  // const handleFilterRating = async (rating) => {
  //   setFilteredRating(rating);
  //   try {
  //     const token = Cookies.get("jwt");
  //     const response = await fetch(
  //       `https://trip-genie-apis.vercel.app/${userRole}/products/${id}/reviews?rating=${rating}`,
  //       {
  //          credentials: "include", headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch filtered reviews");
  //     }

  //     const data = await response.json();
  //     setProduct({ ...product, reviews: data });
  //   } catch (error) {
  //     console.error("Error fetching filtered reviews:", error);
  //   }
  // };

  const handleArchive = async () => {
    setShowArchiveConfirm(false);
    setLoading(true);
    setArchiveError(null);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `https://trip-genie-apis.vercel.app/${userRole}/archiveproducts/${id}`,
        {
         method: "PUT",
mode: "no-cors",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setArchiveError(errorData.message);
          return;
        }
        throw new Error("Failed to archive product");
      }

      const data = await response.json();
      setProduct(data.product);
      setError(null);

      //setShowArchiveSuccess(true);
    } catch (err) {
      setError("Error archiving product. Please try again later.");
      console.error("Error archiving product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    setDeleteError(null);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `https://trip-genie-apis.vercel.app/${userRole}/products/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setDeleteError(errorData.message);
          return;
        }
        throw new Error("Failed to delete product");
      }

      setShowDeleteSuccess(true);
    } catch (err) {
      setError("Error deleting product. Please try again later.");
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    setQuantity(parseInt(value));
  };

  const handleCheckoutNow = () => {
    handleAddToCart();
    window.location.href = "/checkout2"; // Replace with your actual checkout URL
  };

  const handleAddToCart = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        "https://trip-genie-apis.vercel.app/tourist/product/addToCart",
        {
          method: "POST",
   
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: quantity,
            totalAmount: product.price * quantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      setActionSuccess("Product added to cart successfully!");
      window.dispatchEvent(new Event("cartUpdated"));
      setIsPopupOpen(false);
    } catch (error) {
      setActionError("Error adding product to cart. Please try again.");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `https://trip-genie-apis.vercel.app/tourist/product/addToWishlist/${id}`,
        {
          method: "POST",
   
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add to wishlist");
      }

      setActionSuccess("Product added to wishlist successfully!");
    } catch (error) {
      setActionError("Error adding product to wishlist. Please try again.");
    }
  };

  const handleRemoveFromWishlist = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `https://trip-genie-apis.vercel.app/tourist/remove/wishlist/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      setActionSuccess("Product removed from wishlist successfully!");
    } catch (error) {
      setActionError("Error removing product from wishlist. Please try again.");
    }
  };

  const handlePurchase = async (fullLocation) => {
    try {
      const token = Cookies.get("jwt");
      await setLocation(fullLocation);

      // Calculate the total amount for this purchase
      const totalAmount = product.price * quantity;

      // Make the POST request to purchase the single product
      const response = await fetch(
        "https://trip-genie-apis.vercel.app/tourist/purchase",
        {
          method: "POST",
   
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            products: [
              {
                product: product._id, // The ID of the single product
                quantity: quantity, // Quantity being purchased
              },
            ], // Array of products (productId, quantity, totalPrice)
            totalAmount, // Total price for the entire purchase
            paymentMethod: paymentMethod, // Payment method selected by the user
            shippingAddress: location, // Shipping address
            locationType: locationType, // Location type (e.g., home, office)
            deliveryType: deliveryType,
            deliveryTime: deliveryTime,
            deliveryDate: deliveryDate, // Delivery type (e.g., Standard, Express)
          }),
        }
      );

      // Check for errors in the response
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          setActionError(errorData.message);
          setShowPurchaseConfirm(false);
          return;
        } else {
          throw new Error("Failed to complete purchase");
        }
      }

      // Handle successful purchase
      setActionSuccess("Purchase completed successfully!");
      setShowPurchaseConfirm(false);
      setHasPurchased(true);
    } catch (error) {
      // Handle any error during the purchase process
      setActionError("Error completing purchase. Please try again.");
      setShowPurchaseConfirm(false);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `https://trip-genie-apis.vercel.app/tourist/product/rate/${id}`,
        {
          method: "POST",
   
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      setActionSuccess("Rating submitted successfully!");
      setShowRatingDialog(false);
      // Refresh product details to show updated rating
      const updatedProductResponse = await fetch(
        `https://trip-genie-apis.vercel.app/${userRole}/products/${id}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (updatedProductResponse.ok) {
        const updatedProduct = await updatedProductResponse.json();
        setProduct(updatedProduct);
      }
    } catch (error) {
      setActionError("Error submitting rating. Please try again.");
    }
  };

  const handleQuickRating = async (rating) => {
    try {
      const token = Cookies.get("jwt");
      const method = userReview ? "PUT" : "POST";
      const url = userReview
        ? `https://trip-genie-apis.vercel.app/tourist/product/updateComment/${id}`
        : `https://trip-genie-apis.vercel.app/tourist/product/comment/${id}`;

      const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, username: isAnonymous }),
      });
      if (!response.ok) throw new Error("Failed to submit rating");
      setQuickRating(rating);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting rating:", error);
      setActionError("Error submitting rating. Please try again.");
    }
  };
  const guideSteps = [
    {
      target: "body",
      content:
        "Now you can explore the details of this product, including its seller, cost, and reviews. Press next for more information or to make a purchase!",
      placement: "center",
    },
    {
      target: ".Productdetail",
      content:
        "This section provides an overview of the Product, including its price, availability and description.",
      placement: "left",
    },
    // Conditionally add the addToCart step based on product.quantity
    ...(product?.quantity > 0 && userRole === "tourist"
      ? [
          {
            target: ".addToCart",
            content: "Click here to add the product to your cart.",
            placement: "left",
          },
        ]
      : []),
    // Conditionally add the addToWishlist step based on userRole
    ...(userRole === "tourist"
      ? [
          {
            target: ".addToWishlist",
            content: (
              <>
                {" "}
                Click here to add this product to your wishlist for later
                viewing or purchase.
                <br />
                Tip:
                <br />
                You can view your wishlist from the top right corner of the page
              </>
            ),
            placement: "left",
          },
        ]
      : []),

    // Conditionally add the addToWishlist step based on userRole
    ...(product?.seller
      ? [
          {
            target: ".sellerDetails",
            content: (
              <>
                {" "}
                Here you can find information about the seller of this product,
                including their name and ratings.
                <br />
                Tip:
                <br />
                You can view your wishlist from the top right corner of the page
              </>
            ),
            placement: "left",
          },
        ]
      : []),
  ];

  const handleCommentSubmit = async () => {
    try {
      const token = Cookies.get("jwt");
      const method = userReview ? "PUT" : "POST";
      const url = userReview
        ? `https://trip-genie-apis.vercel.app/tourist/product/updateComment/${id}`
        : `https://trip-genie-apis.vercel.app/tourist/product/comment/${id}`;

      const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
          username: isAnonymous,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit review");
      setActionSuccess("Review submitted successfully!");
      setShowCommentDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting review:", error);
      setActionError("Error submitting review. Please try again.");
    }
  };
  const ItineraryDetailSkeleton = () => {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-[#1a202c] shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="h-6 w-32 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </nav>

        <div className="mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-10 w-1/2 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>

                  <div className="w-full h-[400px] bg-gray-300 rounded animate-pulse mb-6"></div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/4">
              <Card>
                <CardHeader>
                  <div className="h-8 w-3/4 bg-gray-300 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 text-4xl font-semibold text-center animate-pulse">
                    <div className="text-sm text-gray-500 flex items-center justify-center mt-6"></div>
                  </div>

                  <div className="mt-4 animate-pulse">
                    <div className="h-12 w-1/2 bg-gray-300 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-300 rounded mt-40"></div>
                  </div>

                  <div className="mt-6 animate-pulse">
                    <div className="h-10  bg-gray-300 rounded"></div>
                    <div className="h-10 bg-gray-300 rounded mt-6"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="h-8 w-1/4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
              </div>

              <div className="flex gap-8 mb-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
                  <div className="h-4 w-16 bg-gray-300 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="flex-1 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="h-6 w-1/4 bg-gray-300 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse mb-4"></div>
              <div className="flex items-left justify-between mb-4">
                <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1 flex justify-between px-4">
                  {[...Array(3)].map((_, i) => (
                    <Card
                      key={i}
                      className="w-[30%] bg-gray-100 shadow-none border-none p-4 rounded-lg"
                    >
                      <CardHeader className="flex items-start">
                        <div className="flex">
                          <div className="h-12 w-12 bg-gray-300 rounded-full animate-pulse mr-4"></div>
                          <div className="flex flex-col">
                            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                            <div className="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 w-full bg-gray-300 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-full bg-gray-300 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <ItineraryDetailSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>No product found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div className=" mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-5xl font-bold">
                    {product.name}
                  </CardTitle>
                  <div>
                    <ToastProvider>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                                    <div className="group">

                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            <Share2 className="h-4 w-4" />
               {(userCluster == "0-0" || userCluster == "1-1" ||userCluster == "3-1") &&

                                                   <div className="absolute  mt-16 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-20">
                                                             Share
                                                           </div>
}
                          </Button>
                          </div>

                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              onClick={handleCopyLink}
                              className="flex items-center justify-start px-4 py-2 hover:text-[#5D9297]"
                            >
                              <Link className="mr-2 h-4 w-4" />
                              Copy Link
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={handleEmailShare}
                              className="flex items-center justify-start px-4 py-2 hover:text-[#5D9297]"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Share by Email
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <ToastViewport />

                      {isToastOpen && (
                        <Toast
                          onOpenChange={setIsToastOpen}
                          open={isToastOpen}
                          duration={3000}
                        >
                          {" "}
                          {/* Auto close after 3 seconds */}
                          <ToastTitle>Link Copied</ToastTitle>
                          <ToastDescription>
                            The link has been copied to your clipboard.
                          </ToastDescription>
                          <ToastClose />
                        </Toast>
                      )}
                    </ToastProvider>
                  </div>
                </div>
                <CardDescription className="flex items-center justify-end"></CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full h-[400px]">
                    <ImageGallery pictures={product.pictures} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {/* First Badge: Sales with ShieldCheck Icon */}
                  <Badge
                    variant="secondary"
                    className="flex items-center text-md bg-[#5D9297] text-white hover:bg-[#5D9297] hover:text-white"
                  >
                    <ShieldCheck className="mr-2" />{" "}
                    {/* Add the ShieldCheck icon */}
                    Sold by Premier Dealers
                  </Badge>

                  {/* Second Badge: Top Rated with Star Icon (only if product.rating >= 4) */}
                  {product.rating >= 4 && (
                    <Badge
                      variant="secondary"
                      className="flex items-center text-md bg-[#5D9297] text-white hover:bg-[#5D9297] hover:text-white"
                    >
                      <Star className="mr-2" /> {/* Add the Star icon */}
                      Top Rated
                    </Badge>
                  )}

                  {/* Third Badge: Sales with Flame Icon */}
                  <Badge
                    variant="secondary"
                    className="flex items-center text-md bg-[#5D9297] text-white hover:bg-[#5D9297] hover:text-white"
                  >
                    {" "}
                    <TrendingUp className="mr-2" /> {/* Add the Flame icon */}
                    {product.sales} Sales
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Ratings & Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">
                      {product.rating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="text-sm text-gray-500">out of 5</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {product.reviews?.length || 0} Ratings
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = ratingDistribution[stars] || 0;
                      const percentage = product.reviews?.length
                        ? Math.round((count / product.reviews.length) * 100)
                        : 0;
                      return (
                        <RatingDistributionBar
                          key={stars}
                          percentage={percentage}
                          count={stars}
                        />
                      );
                    })}
                  </div>
                </div>

                {hasPurchased && (
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-500 mb-2">
                      Tap to Rate:
                    </div>
                    <div
                      className="flex gap-2"
                      onMouseLeave={() => setIsRatingHovered(false)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-8 h-8 cursor-pointer ${
                            (
                              isRatingHovered
                                ? quickRating >= star
                                : quickRating >= star
                            )
                              ? "text-[#F88C33] fill-current"
                              : "text-gray-300"
                          }`}
                          onMouseEnter={() => {
                            setIsRatingHovered(true);
                            setQuickRating(star);
                          }}
                          onClick={() => handleQuickRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {hasPurchased && (
                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full mb-4 bg-[#388A94] hover:bg-[#2e6b77] addReview"
                      onClick={() => setShowCommentDialog(true)}
                    >
                      {userReview ? "Edit Your Review" : "Write a Review"}
                    </Button>
                  </div>
                )}
                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    <>
                      {product.reviews.length > 5 && (
                        <span
                          className="text-[#388A94] font-semibold justify-end hover:underline flex justify-end cursor-pointer mt-6"
                          onClick={() => setShowAllReviews(true)}
                        >
                          View More Reviews
                        </span>
                      )}
                      {product.reviews.slice(0, 5).map((review, index) => (
                        <div key={index} className="flex space-x-4">
                          <Avatar>
                            <AvatarFallback>{review.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold">
                                {review.user}
                              </h4>
                              <StarRating rating={review.rating} />
                            </div>
                            <p className="text-gray-600 mt-1">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="space-y-6">
              <Card>
                {/* Product Info Section */}
                <CardHeader>
                  <CardDescription className="flex items-center">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, index) => {
                        let ratingValue = 0;
                        if (product.rating) {
                          ratingValue = Math.floor(product.rating);
                        }
                        const isHalfStar = product.rating - ratingValue >= 0.5; // Check for half-star

                        if (index < ratingValue) {
                          // Full star
                          return (
                            <Star
                              key={index}
                              fill="#F88C33"
                              strokeWidth={0}
                              className="w-7 h-7"
                            />
                          );
                        } else if (index === ratingValue && isHalfStar) {
                          // Half star
                          return (
                            <StarHalf
                              key={index}
                              fill="#F88C33"
                              strokeWidth={0}
                              className="w-7 h-7"
                            />
                          );
                        } else {
                          // Empty star (if you have a separate empty Star component, use it here)
                          return (
                            <Star
                              key={index}
                              fill="#E5E7EB"
                              strokeWidth={0}
                              className="w-7 h-7"
                            />
                          );
                        }
                      })}
                      <span className="text-xl font-semibold text-black ml-2">
                        {product.rating ? product.rating.toFixed(1) : 0}
                      </span>
                    </div>

                    <span className="  text-[#5D9297] text-medium font-semibold ml-4">
                      {product.reviews ? product.reviews.length : 0} Item
                      Ratings
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className=" space-y-4">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-blue-500">
                        {userRole === "admin" || userRole === "seller" ? (
                          product.quantity > 0 ? (
                            `${product.quantity} left in stock`
                          ) : (
                            <span className="text-red-500 text-3xl font-bold">
                              Out of stock
                            </span>
                          )
                        ) : product.quantity > 0 ? (
                          <>
                            {/* <Package className="w-6 h-6 mr-2 text-blue-500" /> */}
                          </>
                        ) : (
                          <div className="w-full">
                            <span className="block text-red-500 text-4xl font-bold w-full">
                              Out of stock
                            </span>
                            <div className="mt-2 text-sm text-gray-600 w-full">
                              Add to wishlist now and you will be notified when
                              it's back in stock!
                            </div>
                          </div>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {userRole === "tourist" ? (
                        product.sales > 0 ? (
                          <></>
                        ) : (
                          <>
                            {/* Tourist sees this if there are no sales */}
                            {/* <span className="text-lg font-semibold text-blue-500">
                              Be the first to try it!
                            </span> */}
                          </>
                        )
                      ) : userRole === "admin" || userRole === "seller" ? (
                        <>
                          {product.sales > 0 ? (
                            <>
                              {/* Admin or seller sees this if there are sales */}
                              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                              <span className="text-lg font-semibold text-green-500">
                                {product.sales} sold
                              </span>
                            </>
                          ) : (
                            <>
                              {/* Admin or seller sees this if there are no sales */}
                              <XCircleIcon className="w-6 h-6 mr-2 text-red-500" />
                              <span className="text-lg font-semibold text-red-500">
                                No sales yet
                              </span>
                            </>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="Productdetail">
                    <div className="flex items-center">
                      {/* <DollarSign className="w-6 h-6 mr-2 text-green-500" /> */}
                      <span className="text-5xl font-bold text-[#1A3B47]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2 mt-2">
                      <Info className="w-5 h-5 mr-2" />
                      <p>Price includes VAT</p>
                    </div>
                    {product.quantity <= 5 ? (
                      product.quantity !== 0 && (
                        <p className="text-red-600 font-semibold text-xl mb-4">
                          Only {product.quantity} left in stock! Buy now!
                        </p>
                      )
                    ) : (
                      <span className="text-green-600 text-lg font-semibold">
                        Still in stock!
                      </span>
                    )}
                    <div>
                      <p className="text-gray-700 inline break-words ">
                        {isExpanded ||
                        product.description.length <= characterLimit
                          ? product.description
                          : `${product.description.slice(
                              0,
                              characterLimit
                            )}...`}

                        {/* "View More / View Less" link placed inline */}
                        {product.description.length > characterLimit && (
                          <button
                            className="text-[#5D9297] font-semibold inline ml-1 hover:underline "
                            onClick={toggleExpansion}
                          >
                            {isExpanded ? "View Less" : "View More"}
                          </button>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {(userRole === "admin" ||
                      (userRole === "seller" &&
                        canModify &&
                        product.seller)) && (
                      <Button
                        className="w-full bg-[#1A3B47] text-xl  text-white"
                        variant="default"
                        onClick={handleUpdate}
                      >
                        <Edit className="w-5 h-5 mr-2" /> Update Product
                      </Button>
                    )}

                    {((userRole === "admin" && product.seller == null) ||
                      (userRole === "seller" &&
                        canModify &&
                        product.seller)) && (
                      <Button
                        variant={product.isArchived ? "outline" : "default"}
                        className="w-full text-xl bg-[#388A94] hover:bg-[#2d6e78] text-white"
                        onClick={() => setShowArchiveConfirm(true)}
                      >
                        {product.isArchived ? (
                          <>
                            <ArchiveX className="w-5 h-5 mr-2" /> Unarchive
                            Product
                          </>
                        ) : (
                          <>
                            <Archive className="w-5 h-5 mr-2" /> Archive Product
                          </>
                        )}
                      </Button>
                    )}

                    {(userRole === "admin" ||
                      (userRole === "seller" &&
                        canModify &&
                        product.seller)) && (
                      <Button
                        className="w-full text-xl bg-red-500 hover:bg-red-600"
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="w-5 h-5 mr-2" /> Delete Product
                      </Button>
                    )}
                  </div>
                </CardContent>

                <div className="space-y-4 mt-5 flex items-center justify-center px-4">
                  {userRole === "tourist" && (
                    <div className="space-y-2 w-full">
                      {/* Add to Cart Button - Only if product quantity is greater than 0 */}
                      {product.quantity > 0 && (
                        <Button
                          variant="outline"
                          className="w-full text-xl border-[#388A94] text-[#388A94] hover:bg-green-50 font-bold py-2 flex items-center justify-center addToCart"
                          onClick={handleAddToCart}
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Add to Cart
                        </Button>
                      )}

                      {/* Add to Wishlist Button - Always visible */}
                      <Button
                        variant="secondary"
                        className={`w-full text-xl text-white font-bold py-2 flex items-center justify-center addToWishlist ${
                          isWishlisted
                            ? "bg-red-600 hover:bg-red-500"
                            : "bg-[#1A3B47] hover:bg-[#152D38]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isWishlisted) {
                            handleRemoveFromWishlist();
                          } else {
                            handleAddToWishlist();
                          }
                          setIsWishlisted(!isWishlisted);
                        }}
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        {isWishlisted
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>

                {/* Delivery Options Section */}
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Standard Shipping */}
                    <div>
                      <div className="flex justify-between text-xl">
                        <span className="font-semibold text-[#388A94]">
                          Standard Shipping
                        </span>
                        <span>{formatPrice(2.99)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        2–8 business days
                      </div>
                    </div>

                    {/* Express Shipping */}
                    <div>
                      <div className="flex justify-between text-xl">
                        <span className="font-semibold text-[#388A94]">
                          Express Shipping
                        </span>
                        <span>{formatPrice(4.99)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        1–3 business days
                      </div>
                    </div>

                    {/* Next-Day/Same-Day Shipping */}
                    <div>
                      <div className="flex justify-between text-xl">
                        <span className="font-semibold text-[#388A94]">
                          Next-Day/Same-Day Shipping
                        </span>
                        <span>{formatPrice(6.99)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Next day or same day delivery
                      </div>
                    </div>

                    {/* International Shipping */}
                    <div>
                      <div className="flex justify-between text-xl">
                        <span className="font-semibold text-[#388A94]">
                          International Shipping
                        </span>
                        <span>{formatPrice(14.99)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        7–21 business days (depending on location)
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Divider */}
                <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>

                {/* Shop with Confidence Section */}
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">
                    Shop with Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center text-lg">
                      <Coins className="w-5 h-5 mr-2 text-[#5D9297]" />
                      Buyer Protection
                    </li>
                    <li className="flex items-center text-lg">
                      <RotateCcw className="w-5 h-5 mr-2 text-[#5D9297]" />
                      30 day returns
                    </li>
                    <li className="flex items-center text-lg">
                      <Phone className="w-5 h-5 mr-2 text-[#5D9297]" />
                      Easy access to support
                    </li>
                    <li className="flex items-center text-lg">
                      <CreditCard className="w-5 h-5 mr-2 text-[#5D9297]" />
                      Secure, flexible payment options
                    </li>
                  </ul>
                </CardContent>

                {/* {hasPurchased && (
    
          <CardContent className="pt-6">
              <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>

            <div className="space-y-2">
              {/* Rate Product Button */}
                {/* <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 flex items-center justify-center"
                onClick={() => setShowRatingDialog(true)}
              >
                <Star className="w-5 h-5 mr-2" />
                Rate Product
              </Button> */}

                {/* Add Review Button */}
                {/* <Button
                className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-50 font-bold py-2 flex items-center justify-center"
                variant="outline"
                onClick={() => setShowCommentDialog(true)}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Add Review
              </Button>
            </div>
          </CardContent> */}

                {/* )} */}
                <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>
                {product.seller && (
                  <>
                    {/* Verified Seller Badge aligned to the right */}

                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold">Sold By</span>
                        <Badge
                          variant="secondary"
                          className="px-2 py-1 text-xs font-medium rounded-full bg-[#388A94] text-white hover:bg-[#388A94] hover:text-white"
                        >
                          Verified Seller
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center sellerDetails">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback>
                            <StoreIcon className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h3 className="text-2xl font-bold text-[#1A3B47]">
                            {product.seller.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className="font-semibold text-xs">
                              95% positive
                            </span>
                            <span className="mx-2">|</span>
                            <span className="font-semibold text-xs">
                              {product.allRatings.length} ratings
                            </span>
                            <span className="mx-2">|</span>
                            <span className="font-semibold text-xs">
                              Open since 2021 {product.seller.sellerSince}
                            </span>
                          </div>
                          <div className="flex items-center mt-2">
                            <StarRating rating={product.rating} />
                            <span className="ml-2 text-lg font-semibold">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {showMore && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm">
                            <Mail className="h-5 w-5 mr-2 text-gray-500" />
                            <span>{product.seller.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-5 w-5 mr-2 text-gray-500" />
                            <span>{product.seller.mobile}</span>
                          </div>
                        </div>
                      )}
                      <div className="mt-4">
                        <Button
                          variant="link"
                          className="w-full p-0 h-auto font-normal text-blue-500 hover:text-blue-700"
                          onClick={() => setShowMore(!showMore)}
                        >
                          {showMore ? "Less Info" : "More Info"}
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {product.isArchived ? "Unarchive" : "Archive"} Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {product.isArchived ? "unarchive" : "archive"} this product?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveConfirm(false)}
              className="bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleArchive}
              className="bg-[#388A94] hover:bg-[#2d6e78]"
            >
              {product.isArchived ? "Unarchive" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <Dialog open={showArchiveSuccess} onOpenChange={setShowArchiveSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Product {product.isArchived ? "Unarchived" : "Archived"}
            </DialogTitle>
            <DialogDescription>
              The product has been successfully{" "}
              {product.isArchived ? "unarchived" : "archived"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="default"
              className="bg-[#388A94] hover:bg-[#2d6e78]"
              onClick={() => {
                if (product.isArchived) {
                  navigate("/product-archive");
                } else {
                  navigate("/all-products");
                }
              }}
            >
              {product.isArchived
                ? "Back to all archived products"
                : "Back to all products"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      <Dialog
        open={archiveError !== null}
        onOpenChange={() => setArchiveError(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to {product.isArchived ? "Unarchive" : "Archive"} Product
            </DialogTitle>
            <DialogDescription>{archiveError}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end mt-2">
            <Button
              variant="default"
              onClick={() => setArchiveError(null)}
              className="bg-[#1A3B47] hover:bg-[#3E5963] text-white px-4 py-2 rounded-lg"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Product Deleted
            </DialogTitle>
            <DialogDescription>
              The product has been successfully deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => navigate("/all-products")}>
              Back to All Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteError !== null}
        onOpenChange={() => setDeleteError(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to Delete Product
            </DialogTitle>
            <DialogDescription>{deleteError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-end mt-2">
              <Button
                variant="default"
                onClick={() => setDeleteError(null)}
                className="bg-[#1A3B47] hover:bg-[#3E5963] text-white px-4 py-2 rounded"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#1A3B47] text-2xl">
              Choose an option
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Button
              className="bg-[#388A94] text-lg text-white hover:bg-[#306e78]"
              onClick={handleAddToCart}
            >
              Add to Cart and Continue Shopping
            </Button>
            <Button
              className="bg-[#1A3B47] text-lg text-white hover:bg-[#15303a]"
              onClick={handleCheckoutNow}
            >
              Add to cart and Checkout Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Product</DialogTitle>
            <DialogDescription>
              How would you rate this product?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-4">
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRating(0);
                setShowRatingDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleRatingSubmit();
                setRating(0);
                setShowRatingDialog(false);
              }}
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userReview ? "Edit Your Review" : "Add Review"}
            </DialogTitle>
            <DialogDescription>
              Share your thoughts about this product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center items-center">
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>
            <Textarea
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous-mode"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous-mode">Post anonymously</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-gray-300 text-black hover:bg-gray-400 mr-2"
              onClick={() => {
                setRating(userReview ? userReview.rating : 0);
                setComment(userReview ? userReview.comment : "");
                setIsAnonymous(userReview.username === "Anonymous");
                setShowCommentDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCommentSubmit}
              className="bg-[#1A3B47]  text-white "
              disabled={rating === 0 || comment?.trim() === ""}
            >
              {userReview ? "Update Review" : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={actionSuccess !== null}
        onOpenChange={() => setActionSuccess(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Success
            </DialogTitle>
            <DialogDescription>{actionSuccess}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-[#388A94] hover:bg-[#2e6b77]"
              onClick={() => setActionSuccess(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={actionError !== null}
        onOpenChange={() => setActionError(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Error
            </DialogTitle>
            <DialogDescription>{actionError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => setActionError(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAllReviews} onOpenChange={setShowAllReviews}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>All Reviews</DialogTitle>
            <DialogDescription>
              <div className="text-center my-4">
                <span className="text-gray-500 uppercase text-sm">Overall</span>
                <div className="flex justify-center items-center">
                  <span className="text-4xl font-bold">
                    {product.rating ? product.rating.toFixed(1) : 0}
                  </span>
                  <div className="ml-2 flex items-center">
                    {[...Array(5)].map((_, i) => {
                      if (i < Math.floor(product.rating)) {
                        return (
                          <Star key={i} className="w-6 h-6 text-[#1A3B47]" />
                        );
                      } else if (
                        i === Math.floor(product.rating) &&
                        product.rating % 1 >= 0.5
                      ) {
                        return (
                          <StarHalf
                            key={i}
                            className="w-6 h-6 text-[#1A3B47]"
                          />
                        );
                      } else {
                        return (
                          <Star key={i} className="w-6 h-6 text-gray-300" />
                        );
                      }
                    })}
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-600">
                  {product.allRatings
                    ? `${product.allRatings.length} Ratings`
                    : "No Ratings Yet"}
                </p>
                <hr className="my-4 border-t border-gray-300" />
              </div>

              {/* Filter by Rating Buttons */}
              <div className="flex justify-center space-x-2 mb-4">
                <button
                  className={`px-3 py-2 rounded-md ${
                    filteredRating === 0
                      ? "bg-[#388A94] text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => handleFilterRating(0, product)}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    className={`px-3 py-2 rounded-md ${
                      filteredRating === star
                        ? "bg-[#388A94] text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => handleFilterRating(star, product)}
                  >
                    {star} Star{star > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Reviews List */}
          <div className="space-y-6 max-h-[40vh] overflow-y-auto">
            {filteredReviews?.length > 0 ? (
              filteredReviews.map((review, index) => (
                <div key={index} className="flex space-x-4 border-b pb-4">
                  <Avatar>
                    <AvatarFallback>{review.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{review.user}</h4>
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Show the first 50 characters of the comment and a "Show more" link */}
                    <p className="text-gray-600 mt-1">
                      {isExpandedComment
                        ? review.comment
                        : `${review.comment.slice(0, 100)}...`}
                    </p>

                    {/* Only show "Show more" if the comment length exceeds 50 characters */}
                    {review.comment.length > 100 && (
                      <button
                        onClick={handleToggleComment}
                        className="text-blue-500 mt-2 hover:underline"
                      >
                        {isExpandedComment ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No reviews for this rating.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              className="bg-[#1A3B47]"
              onClick={() => setShowAllReviews(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {(userRole === "guest" || userRole === "tourist") && (
        <UserGuide steps={guideSteps} pageName="singleProduct" />
      )}
    </div>
  );
};

export default ProductDetail;
