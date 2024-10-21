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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Star, Flame,
  Edit,
  Trash2,
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

const StarRating = ({ rating, onRatingChange = null }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          } ${onRatingChange ? "cursor-pointer" : ""}`}
          onClick={() => onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
};

const ImageGallery = ({ pictures }) => {
  const [mainImage, setMainImage] = useState(pictures[0]);
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    setStartIndex((prevIndex) => Math.min(pictures.length - 5, prevIndex + 1));
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="w-1/5 relative">
        <div className="h-full overflow-hidden">
          {pictures.length > 5 && (
            <button
              onClick={handlePrev}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full z-10"
              disabled={startIndex === 0}
              aria-label="Previous images"
            >
              <ChevronUp size={20} />
            </button>
          )}
          <div className="flex flex-col gap-2 h-full">
            {pictures.slice(startIndex, startIndex + 5).map((pic, index) => (
              <img
                key={index}
                src={pic}
                alt={`Product image ${startIndex + index + 1}`}
                className="w-full h-[18%] object-cover rounded-lg cursor-pointer"
                onClick={() => setMainImage(pic)}
              />
            ))}
          </div>
          {pictures.length > 5 && (
            <button
              onClick={handleNext}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full z-10"
              disabled={startIndex >= pictures.length - 5}
              aria-label="Next images"
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>
      </div>
      <div className="w-4/5">
        <img
          src={mainImage}
          alt="Main product image"
          className="w-full h-full object-cover rounded-lg"
        />
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
  const [showArchiveSuccess, setShowArchiveSuccess] = useState(false);
  const [archiveError, setArchiveError] = useState(null);
  const [canModify, setCanModify] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState("12:00-06:00");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("Home");
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filteredRating, setFilteredRating] = useState(0);
  const [streetName, setStreetName] = useState("");
const [streetNumber, setStreetNumber] = useState("");
const [floorUnit, setFloorUnit] = useState("");
const [state, setState] = useState("");
const [city, setCity] = useState("");
const [showMore, setShowMore] = useState(false);
const characterLimit = 150; // Set your desired character limit

  const handleViewMore = () => {
    setShowMore(!showMore);
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
          `http://localhost:4000/${userRole}/products/${id}`,
          {
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

        // Fetch user's purchases
        const purchasesResponse = await fetch(
          "http://localhost:4000/tourist/purchase",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (purchasesResponse.ok) {
          const purchasesData = await purchasesResponse.json();
          setHasPurchased(
            purchasesData.some((purchase) => purchase.product._id === id)
          );
        }
      } catch (err) {
        setError("Error fetching product details. Please try again later.");
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, userRole]);

  const handleUpdate = () => {
    navigate(`/update-product/${id}`);
  };

  const handleFilterRating = async (rating) => {
    setFilteredRating(rating);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${userRole}/products/${id}/reviews?rating=${rating}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filtered reviews");
      }

      const data = await response.json();
      setProduct({ ...product, reviews: data });
    } catch (error) {
      console.error("Error fetching filtered reviews:", error);
    }
  };

  const handleArchive = async () => {
    setShowArchiveConfirm(false);
    setLoading(true);
    setArchiveError(null);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${userRole}/archiveproducts/${id}`,
        {
          method: "PUT",
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

      setShowArchiveSuccess(true);
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
        `http://localhost:4000/${userRole}/products/${id}`,
        {
          method: "DELETE",
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

  const handleAddToCart = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        "http://localhost:4000/tourist/product/addToCart",
        {
          method: "POST",
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
    } catch (error) {
      setActionError("Error adding product to cart. Please try again.");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/tourist/product/addToWishlist/${id}`,
        {
          method: "POST",
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

  const handlePurchase = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch("http://localhost:4000/tourist/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
          totalAmount: product.price * quantity,
          paymentMethod: paymentMethod,
          shippingAddress: location,
          locationType: locationType,
        }),
      });

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

      setActionSuccess("Purchase completed successfully!");
      setShowPurchaseConfirm(false);
      setHasPurchased(true);
    } catch (error) {
      setActionError("Error completing purchase. Please try again.");
      setShowPurchaseConfirm(false);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/tourist/product/rate/${id}`,
        {
          method: "POST",
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
        `http://localhost:4000/${userRole}/products/${id}`,
        {
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

  const handleCommentSubmit = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/tourist/product/comment/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      setActionSuccess("Comment submitted successfully!");
      setShowCommentDialog(false);
      // Refresh product details to show updated comments
      const updatedProductResponse = await fetch(
        `http://localhost:4000/${userRole}/products/${id}`,
        {
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
      setActionError("Error submitting comment. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
    return <div>No product  found.</div>;
  }

  return (
    
    <div className="min-h-screen bg-gray-100 pt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  {product.name}
                </CardTitle>
                <CardDescription className="flex items-center justify-end">
                </CardDescription>
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
  className="flex items-center text-md bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
>
  <ShieldCheck className="mr-2" /> {/* Add the ShieldCheck icon */}
  Sold by Premier Dealers
</Badge>


  {/* Second Badge: Top Rated with Star Icon (only if product.rating >= 4) */}
  {product.rating >= 4 && (
  <Badge 
  variant="secondary" 
  className="flex items-center text-md bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
>
      <Star className="mr-2" /> {/* Add the Star icon */}
      Top Rated
    </Badge>
  )}

  {/* Third Badge: Sales with Flame Icon */}
  <Badge 
  variant="secondary" 
  className="flex items-center text-md bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
>    <TrendingUp className="mr-2" /> {/* Add the Flame icon */}
    {product.sales} Sales
  </Badge>
</div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    <>
                     {product.reviews.length > 5 && (
                     <span 
                     className="text-blue-500 font-semibold justify-end hover:underline flex justify-end cursor-pointer"
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
                            <p className="text-gray-600 mt-1">{review.comment}</p>
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
    <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
    <CardDescription className="flex items-center">
    <div className="flex items-center">
  {Array.from({ length: 5 }, (_, index) => {
    if (product.rating) {
      const ratingValue = Math.floor(product.rating); // Get the integer part
      const isHalfStar = product.rating - ratingValue >= 0.5; // Check for half-star

      if (index < ratingValue) {
        // Full star
        return <Star key={index} fill="#ffef00" strokeWidth={0} className="w-7 h-7" />;
      } else if (index === ratingValue && isHalfStar) {
        // Half star
        return <StarHalf key={index} fill="#ffef00" strokeWidth={0} className="w-7 h-7" />;
      } else {
        // Empty star (if you have a separate empty Star component, use it here)
        return <Star key={index} fill="#E5E7EB" strokeWidth={0} className="w-7 h-7" />;
      }
    }
    return null;
  })}
  <span className="text-xl font-semibold text-black ml-2">
    {product.rating ? product.rating.toFixed(1) : "N/A"}
  </span>
</div>



<span className="ml-2 text-blue-500 font-medium font-semibold">
          {product.reviews ? product.reviews.length : 0} reviews
      </span>
    </CardDescription>
  </CardHeader>
  <CardContent>
  <div className="lg:w-1/2 space-y-4">
                  
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
                        <span className="text-green-600 text-medium">Still in stock!</span>
                    </>

                  ) : (
                    <span className="text-red-500 text-4xl font-bold">
                      Out of stock
                      <div className="mt-2 text-sm text-gray-600">
                        Add to wishlist now and you will be notified when it's back in stock!
                      </div>
                    </span>
                  )}
                 </span>
                  </div>
                  <div className="flex items-center">
                    {product.sales > 0 ? (
                      <>
                        {/* <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                        <span className="text-lg font-semibold text-green-500">
                          {product.sales} sold
                        </span> */}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 mr-2 text-blue-500" />
                        <span className="text-lg font-semibold text-blue-500">
                          Be the first to try it!
                        </span>
                      </>
                    )}
                  </div>
                  {/* {product.sales > 50 && (
                    <p className="text-green-600">Popular product</p>
                  )} */}
                  {product.quantity <= 5 && product.quantity > 0 && (
                    <p className="text-red-600 font-semibold">
                      Only {product.quantity} left in stock! Buy now!
                    </p>
                  )}
                    <div className="flex items-center">
                    {/* <DollarSign className="w-6 h-6 mr-2 text-green-500" /> */}
                    <span className="text-4xl font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>                 
              </div><div className="flex items-center text-sm text-gray-500 mb-4 mt-2">
  <Info className="w-5 h-5 mr-2" />
  <p>Price includes VAT</p>
</div>
<div>
                  <p className="text-gray-700 inline">
                    {isExpanded || product.description.length <= characterLimit
                      ? product.description
                      : `${product.description.slice(0, characterLimit)}...`}
                    
                    {/* "View More / View Less" link placed inline */}
                    {product.description.length > characterLimit && (
                      <button
                        className="text-blue-500 font-semibold inline ml-1 hover:underline "
                        onClick={toggleExpansion}
                      >
                        {isExpanded ? 'View Less' : 'View More'}
                      </button>
                    )}
                  </p>
                </div>   
<div className="space-y-4 mt-5">
      {userRole === "tourist" && (
        <>
        <div className="space-y-2">
  {/* Buy Now Button */}
  <Button className="w-full text-xl bg-green-500 hover:bg-green-600 text-white font-bold py-2 flex items-center justify-center" onClick={() => setShowPurchaseConfirm(true)}>
    {/* <Wallet className="w-5 h-5 mr-2" /> */}
    Buy Now
  </Button>

  {/* Add to Cart Button */}
  <Button variant="outline" className="w-full text-xl border-green-500 text-green-500 hover:bg-green-50 font-bold py-2 flex items-center justify-center" onClick={handleAddToCart}>
    <ShoppingCart className="w-5 h-5 mr-2" />
    Add to Cart
  </Button>

  {/* Add to Wishlist Button */}
  <Button variant="secondary" className="w-full text-xl bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 flex items-center justify-center" onClick={handleAddToWishlist}>
    <Heart className="w-5 h-5 mr-2" />
    Add to Wishlist
  </Button>
</div>
        </>
      )}
    </div>
  </CardContent>

  {/* Divider */}
  <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>

  {/* Delivery Options Section */}
  <CardHeader>
    <CardTitle className="text-2xl font-semibold">Delivery Options</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between text-xl">
        <span className="font-semibold text-green-700">Standard shipping</span>
        <span>€2.99</span>
      </div>
      <div className="text-sm text-gray-500">2 Nov–8</div>
      <div className="flex justify-between text-xl">
        <span className="font-semibold text-green-700">Overnight shipping</span>
        <span>€6.99</span>
      </div>
      <div className="text-sm text-gray-500">18 Nov–23</div>
    </div>
  </CardContent>

  {/* Divider */}
  <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>

  {/* Shop with Confidence Section */}
  <CardHeader>
    <CardTitle className="text-2xl font-semibold">Shop with Confidence</CardTitle>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2">
      <li className="flex items-center text-lg">
        <Coins className="w-5 h-5 mr-2 text-blue-500" />
        Buyer Protection
      </li>
      <li className="flex items-center text-lg">
        <RotateCcw className="w-5 h-5 mr-2 text-blue-500" />
        30 day returns
      </li>
      <li className="flex items-center text-lg">
        <Phone className="w-5 h-5 mr-2 text-blue-500" />
        Easy access to support
      </li>
      <li className="flex items-center text-lg">
        <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
        Secure, flexible payment options
      </li>
    </ul>
  </CardContent>

  {hasPurchased && (
    
          <CardContent className="pt-6">
              <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>

            <div className="space-y-2">
              {/* Rate Product Button */}
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 flex items-center justify-center"
                onClick={() => setShowRatingDialog(true)}
              >
                <Star className="w-5 h-5 mr-2" />
                Rate Product
              </Button>
        
              {/* Add Review Button */}
              <Button
                className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-50 font-bold py-2 flex items-center justify-center"
                variant="outline"
                onClick={() => setShowCommentDialog(true)}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Add Review
              </Button>
            </div>
          </CardContent>
        
            )}
              <div className="border-t-4 border-gray-300 w-1/2 mx-auto my-4"></div>
              {product.seller && (
                <>
 

  {/* Verified Seller Badge aligned to the right */}
  

      <CardHeader>
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold">Sold By</span>
          <Badge variant="secondary" className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white hover:bg-blue-500 hover:text-white">
            Verified Seller
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              <StoreIcon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="text-2xl font-bold">{product.seller.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span className="font-semibold">95% positive</span>
              <span className="mx-2">|</span>
              <span className="font-semibold">{product.allRatings.length} ratings</span>
              <span className="mx-2">|</span>
              <span className="font-semibold">Seller since {product.seller.sellerSince}</span>
            </div>
            <div className="flex items-center mt-2">
              <StarRating rating={product.rating} />
              <span className="ml-2 text-lg font-semibold">{product.rating.toFixed(1)}</span>
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





            <div className="mt-8 space-y-4">
              {(userRole === "admin" ||
                (userRole === "seller" && canModify && product.seller)) && (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={handleUpdate}
                >
                  <Edit className="w-4 h-4 mr-2" /> Update Product
                </Button>
              )}

              {((userRole === "admin" && product.seller == null) ||
                (userRole === "seller" && canModify && product.seller)) && (
                <Button
                  className="w-full"
                  variant={product.isArchived ? "outline" : "default"}
                  onClick={() => setShowArchiveConfirm(true)}
                >
                  {product.isArchived ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" /> Unarchive Product
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" /> Archive Product
                    </>
                  )}
                </Button>
              )}

              {(userRole === "admin" ||
                (userRole === "seller" && canModify && product.seller)) && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                </Button>
              )}
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
            >
              Cancel
            </Button>
            <Button variant="default" onClick={handleArchive}>
              {product.isArchived ? "Unarchive" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showArchiveSuccess} onOpenChange={setShowArchiveSuccess}>
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
      </Dialog>

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
          <DialogFooter>
            <Button variant="default" onClick={() => setArchiveError(null)}>
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
            <Button variant="default" onClick={() => setDeleteError(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
  <DialogContent className="max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold">Confirm Purchase</DialogTitle>
    </DialogHeader>

    {/* Product Details Header */}
    <div className="my-4">
      <h2 className="text-2xl font-bold">Product Details</h2>
      <div className="my-4">
        <p className="text-xl font-semibold"> {product.name}</p>
     
      </div>
      <div className="my-4">
        <label htmlFor="quantity" className="block text-lg font-medium">
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => {
            const value = e.target.value;
            if (value > product.quantity) {
              setQuantityError(true); // Trigger error state
            } else {
              setQuantityError(false); // Clear error
              setQuantity(value);
            }
          }}
          className={`w-full mt-1 px-3 py-2 border rounded-md ${
            quantityError ? 'border-red-500' : ''
          }`}
          min="1"
          max={product.quantity}
        />
        {quantityError && (
          <p className="text-red-500 text-sm mt-1">
            Unavailable amount, max is: {product.quantity}
          </p>
        )}
           <p className="text-xl ">
            <br/>
          Price: ${(product.price * quantity).toFixed(2)}
        </p>
      </div>
    </div>

    {/* Payment & Delivery Header */}
    <div className="my-4">
      <h2 className="text-2xl font-bold">Payment & Delivery</h2>

      {/* Delivery Date Picker */}
      <div className="my-4">
        <label htmlFor="deliveryDate" className="block text-lg font-medium">
          Delivery Date
        </label>
        <input
          type="date"
          id="deliveryDate"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>

      {/* Delivery Time Selector */}
      <div className="my-4">
        <label htmlFor="deliveryTime" className="block text-lg font-medium">
          Delivery Time
        </label>
        <Select value={deliveryTime} onValueChange={setDeliveryTime}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select delivery time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
            <SelectItem value="midday">Midday (12 PM - 3 PM)</SelectItem>
            <SelectItem value="afternoon">Afternoon (3 PM - 6 PM)</SelectItem>
            <SelectItem value="night">Night (6 PM - 9 PM)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method Selector */}
      <div className="my-4">
        <label htmlFor="paymentMethod" className="block text-lg font-medium">
          Payment Method
        </label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="debit_card">Debit Card</SelectItem>
            <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Address Details Header */}
    <div className="my-4">
      <h2 className="text-2xl font-bold">Address Details</h2>
      <div className="my-4">
        <label htmlFor="streetName" className="block text-lg font-medium">Street Name</label>
        <input
          type="text"
          id="streetName"
          value={streetName}
          onChange={(e) => setStreetName(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter street name"
        />
      </div>
      <div className="my-4">
        <label htmlFor="streetNumber" className="block text-lg font-medium">Street Number</label>
        <input
          type="text"
          id="streetNumber"
          value={streetNumber}
          onChange={(e) => setStreetNumber(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter street number"
        />
      </div>
      <div className="my-4">
        <label htmlFor="floorUnit" className="block text-lg font-medium">Floor/Unit</label>
        <input
          type="text"
          id="floorUnit"
          value={floorUnit}
          onChange={(e) => setFloorUnit(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter floor/unit (optional)"
        />
      </div>
      <div className="my-4">
        <label htmlFor="state" className="block text-lg font-medium">State</label>
        <input
          type="text"
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter state"
        />
      </div>
      <div className="my-4">
        <label htmlFor="city" className="block text-lg font-medium">City</label>
        <input
          type="text"
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter city"
        />
      </div>

      {/* Location Type Selector */}
      <div className="my-4">
        <label htmlFor="locationType" className="block text-lg font-medium">Location Type</label>
        <Select value={locationType} onValueChange={setLocationType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select location type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="apartment">Apartment/Condo</SelectItem>
            <SelectItem value="friend_family">Friend/Family's Address</SelectItem>
            <SelectItem value="po_box">PO Box</SelectItem>
            <SelectItem value="office">Office/Business</SelectItem>
            <SelectItem value="pickup_point">Pickup Point</SelectItem>
            <SelectItem value="vacation">Vacation/Temporary Address</SelectItem>
            <SelectItem value="school">School/University</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Dialog Footer */}
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setShowPurchaseConfirm(false);
          setPaymentMethod("");
          setDeliveryDate("");
          setDeliveryTime("");
          // Reset location fields
          setStreetName("");
          setStreetNumber("");
          setFloorUnit("");
          setState("");
          setCity("");
          setLocationType(""); // Reset location type
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          const fullLocation = `${streetName} ${streetNumber}, ${floorUnit}, ${state}, ${city}`;
          setLocation(fullLocation); // Concatenate location details into a single string
          handlePurchase();
          setShowPurchaseConfirm(false);
          setPaymentMethod("");
          setDeliveryDate("");
          setDeliveryTime("");
          // Reset location fields
          setStreetName("");
          setStreetNumber("");
          setFloorUnit("");
          setState("");
          setCity("");
          setLocationType("");
        }}
        disabled={
          !paymentMethod ||
          !deliveryDate ||
          !deliveryTime ||
          !streetName || !streetNumber || !state || !city || // Ensure all location fields are filled
          !quantity ||
          quantityError || // Disable submit if quantity exceeds max
          !locationType // Location type is required
        }
      >
        Confirm Purchase
      </Button>
    </DialogFooter>
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
            <DialogTitle>Add Review</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRating(0);
                setComment("");
                setShowCommentDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleCommentSubmit();
                setRating(0);
                setComment("");
                setShowCommentDialog(false);
              }}
              disabled={rating === 0 || comment.trim() === ""}
            >
              Submit Review
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
            <Button variant="default" onClick={() => setActionSuccess(null)}>
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
  <DialogContent className="max-w-2xl "> {/* Reduced max-width to fit the screen */}
    <DialogHeader>
      <DialogTitle>All Reviews</DialogTitle>
      <DialogDescription>
        {/* Top Section for Overall Rating */}
        <div className="text-center my-4">
          <span className="text-gray-500 uppercase text-sm">Overall</span>

          {/* Overall Rating Number */}
          <div className="flex justify-center items-center">
            <span className="text-4xl font-bold">
              {product.rating ? product.rating.toFixed(1) : "N/A"}
            </span>

            {/* Star Rating Display */}
            <div className="ml-2 flex items-center">
              {[...Array(5)].map((_, i) => {
                if (i < Math.floor(product.rating)) {
                  return <Star key={i} className="w-6 h-6 text-blue-500" />;
                } else if (i === Math.floor(product.rating) && product.rating % 1 >= 0.5) {
                  return <StarHalf key={i} className="w-6 h-6 text-blue-500" />;
                } else {
                  return <Star key={i} className="w-6 h-6 text-gray-300" />;
                }
              })}
            </div>
          </div>

          {/* Total Ratings Count */}
          <p className="text-lg font-semibold text-gray-600">
            {product.allRatings ? `${product.allRatings.length} Ratings` : 'No Ratings Yet'}
          </p>

          {/* Divider Line */}
          <hr className="my-4 border-t border-gray-300" />
        </div>

        {/* Filter by Rating Buttons */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            className={`px-3 py-2 rounded-md ${filteredRating === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterRating(0)}
          >
            All
          </button>
          <button
            className={`px-3 py-2 rounded-md ${filteredRating === 5 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterRating(5)}
          >
            5 Stars
          </button>
          <button
            className={`px-3 py-2 rounded-md ${filteredRating === 4 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterRating(4)}
          >
            4 Stars
          </button>
          <button
            className={`px-3 py-2 rounded-md ${filteredRating === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterRating(3)}
          >
            3 Stars
          </button>
          <button
            className={`px-3 py-2 rounded-md ${filteredRating === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterRating(2)}
          >
            2 Stars
          </button>
          <button
            className={`px-3 py-2 rounded-md ${filteredRating === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterRating(1)}
          >
            1 Star
          </button>
        </div>
      </DialogDescription>
    </DialogHeader>

    {/* Reviews List */}
    <div className="space-y-6 max-h-[40vh] overflow-y-auto">
      {product.reviews.map((review, index) => (
        <div key={index} className="flex space-x-4 border-b pb-4">
          <Avatar>
            <AvatarFallback>{review.user[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">{review.user}</h4>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-gray-600 mt-1">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>

    <DialogFooter>
      <Button onClick={() => setShowAllReviews(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


    </div>
  );
};

export default ProductDetail;