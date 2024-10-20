import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EnhancedCarousel from "./enhanced-carousel";
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Star,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

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
          setHasPurchased(purchasesData.some(purchase => purchase.product._id === id));
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
      const response = await fetch("http://localhost:4000/tourist/product/addToCart", {
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
      });

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
      const response = await fetch(`http://localhost:4000/tourist/product/addToWishlist/${id}`, {  // Send `productId` in URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json(); // Extract the error message from the response
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
      const response = await fetch(`http://localhost:4000/tourist/product/rate/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

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
      const response = await fetch(`http://localhost:4000/tourist/product/comment/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

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
                <CardDescription className="flex items-center">
                  {product.rating ? (
                    <>
                      <StarRating rating={product.rating} />
                      <span className="ml-2 text-lg font-semibold">
                        {product.rating.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="ml-2 text-lg font-semibold">No ratings yet</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedCarousel images={product.pictures} />
                <div className="space-y-4 mt-4">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-green-500" />
                    <span className="text-2xl font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  {(userRole === "admin" || userRole === "seller") && (
                    <>
                      <div className="flex items-center mt-4">
                        {product.sales > 0 ? (
                          <>
                            <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                            <span className="text-lg font-semibold text-green-500">
                              {product.sales} sold
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 mr-2 text-red-500" />
                            <span className="text-lg font-semibold text-red-500">
                              No sales yet
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center">
                        <Package className="w-6 h-6 mr-2 text-blue-500" />
                        <span
                          className={`text-lg  font-semibold ${
                            product.quantity === 0
                              ? "text-blue-500"
                              : "text-blue-500"
                          }`}
                        >
                          {product.quantity === 0
                            ? "All products sold"
                            : `${product.quantity} still in stock`}
                        </span>
                      </div>
                    </>
                  )}
                  <p className="text-gray-700">{product.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Travelers' Experiences
                </CardTitle>
                <CardDescription>
                  Here's some awesome feedback from our travelers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {product.reviews.map((review, index) => (
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            {product.seller && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    Seller Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={product.seller.avatar} />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {product.seller.name}
                      </h3>
                      <Badge variant="secondary">Verified Seller</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-gray-500" />
                      <span>{product.seller.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-gray-500" />
                      <span>{product.seller.mobile}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

<Card className="mt-4">
  <CardContent className="pt-6">
    {product.quantity === 0 ? (
      <p className="text-red-500 text-center">No more left</p>
    ) : (
      <>
        <Select value={quantity.toString()} onValueChange={handleQuantityChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select quantity" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(Math.min(10, product.quantity)).keys()].map((i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2 mt-4">
          <Button 
            className="w-full" 
            onClick={() => setShowPurchaseConfirm(true)}
            disabled={product.quantity === 0}
          >
            Purchase Now
          </Button>
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
          >
            Add to Cart
          </Button>
          <Button className="w-full" variant="secondary" onClick={handleAddToWishlist}>
            Add to Wishlist
          </Button>
        </div>
      </>
    )}
  </CardContent>
</Card>


            {hasPurchased && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => setShowRatingDialog(true)}>
                      Rate Product
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => setShowCommentDialog(true)}>
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-8 space-y-4">
              {(userRole === "admin" ||
                (userRole === "seller" && canModify)) && (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={handleUpdate}
                >
                  <Edit className="w-4 h-4 mr-2" /> Update Product
                </Button>
              )}

              {((userRole === "admin" && product.seller == null) ||
                (userRole === "seller" && canModify)) && (
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
                (userRole === "seller" && canModify)) && (
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

      {/* Archive Confirmation Dialog */}
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

      {/* Archive Success Dialog */}
      <Dialog open={showArchiveSuccess} onOpenChange={setShowArchiveSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Product {product.isArchived ? "Unarchived" : "Archived"}
            </DialogTitle>
            <DialogDescription>
              The product has been successfully {}
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
              
            >{
              product.isArchived
                ? "Back to all archived products"
                : "Back to all products"
            }</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Error Dialog */}
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

      {/* Delete Confirmation Dialog */}
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

      {/* Delete Success Dialog */}
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

      {/* Delete Error Dialog */}
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

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Purchase</DialogTitle>
      <DialogDescription>
        Product: {product.name}
        <br />
        Quantity: {quantity}
        <br />
        Total Price: ${(product.price * quantity).toFixed(2)}
      </DialogDescription>
    </DialogHeader>
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
    <DialogFooter>
      {/* Cancel button resets everything */}
      <Button
        variant="outline"
        onClick={() => {
          setShowPurchaseConfirm(false);   // Close the dialog
          setPaymentMethod("");             // Reset payment method
        }}
      >
        Cancel
      </Button>
      {/* Disable if paymentMethod is not selected */}
      <Button
  onClick={() => {
    handlePurchase(); // Call your purchase logic
    setShowPurchaseConfirm(false); // Close the dialog
    setPaymentMethod("");           // Reset payment method
  }}
  disabled={!paymentMethod}
>
  Confirm Purchase
</Button>

    </DialogFooter>
  </DialogContent>
</Dialog>



      {/* Rating Dialog */}
{/* Rating Dialog */}
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
          setRating(0); // Reset the rating to 0
          setShowRatingDialog(false); // Close the dialog
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          handleRatingSubmit(); // Submit the rating
          setRating(0); // Reset the rating after submission
          setShowRatingDialog(false); // Close the dialog after submission
        }}
        disabled={rating === 0}
      >
        Submit Rating
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Comment Dialog */}
<Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Comment</DialogTitle>
      <DialogDescription>
        Share your thoughts about this product
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="flex justify-center items-center">
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      <Textarea
        placeholder="Write your comment here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setRating(0); // Reset the rating to 0
          setComment(""); // Reset the comment to an empty string
          setShowCommentDialog(false); // Close the dialog
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          handleCommentSubmit(); // Submit the comment
          setRating(0); // Reset the rating after submission
          setComment(""); // Reset the comment after submission
          setShowCommentDialog(false); // Close the dialog after submission
        }}
        disabled={rating === 0 || comment.trim() === ""}
      >
        Submit Comment
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>



      {/* Action Success Dialog */}
      <Dialog open={actionSuccess !== null} onOpenChange={() => setActionSuccess(null)}>
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

      {/* Action Error Dialog */}
      <Dialog open={actionError !== null} onOpenChange={() => setActionError(null)}>
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
    </div>
  );
};

export default ProductDetail;