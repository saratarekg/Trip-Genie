import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";
import Loader from "./Loader";

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState("guest");
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencies, setCurrencies] = useState([]);

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/rates");
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  }, []);

  const fetchCurrencies = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        "http://localhost:4000/tourist/currencies",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrencies(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  }, []);

  const formatPrice = useCallback(
    (price, productCurrency) => {
      if (!price || !productCurrency || !userRole) {
        console.error("Missing required parameters for formatPrice");
        return "";
      }

      const roundedPrice = Math.round(price);
      if (userRole === "tourist" && userPreferredCurrency) {
        const baseRate = exchangeRates[productCurrency] || 1;
        const targetRate = exchangeRates[userPreferredCurrency.code] || 1;
        const exchangedPrice = Math.round(
          (roundedPrice / baseRate) * targetRate
        );
        return `${userPreferredCurrency.symbol}${exchangedPrice}`;
      }
      const currency = currencies.find((c) => c._id === productCurrency);
      return `${currency ? currency.symbol : "$"}${roundedPrice}`;
    },
    [userRole, userPreferredCurrency, exchangeRates, currencies]
  );

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    setUserRole(role);

    if (role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        if (!token) {
          console.error("No JWT token found");
          return;
        }

        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currencyId = response.data.preferredCurrency;

        if (currencyId) {
          const response2 = await axios.get(
            `http://localhost:4000/tourist/getCurrency/${currencyId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserPreferredCurrency(response2.data);
        } else {
          console.error("No preferred currency found for user");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }, []);

  const fetchWishlistItems = useCallback(async () => {
    if (!userRole) {
      console.error("User role not set");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("jwt");
      if (!token) {
        console.error("No JWT token found");
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:4000/tourist/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist items");
      }
      const data = await response.json();

      const formattedData = data.map((item) => {
        if (!item.product || !item.product.price || !item.product.currency) {
          console.error("Invalid product data:", item);
          return null;
        }
        return {
          ...item,
          formattedPrice: formatPrice(
            item.product.price,
            item.product.currency
          ),
        };
      });

      setWishlistItems(formattedData.filter(Boolean));
      setTimeout(() => setLoading(false), 500)
    } catch (err) {
      setError("Error fetching wishlist items. Please try again later.");
      console.error("Error fetching wishlist items:", err);
      setLoading(false)
    }
  }, [userRole, formatPrice]);

  useEffect(() => {
    fetchUserInfo();
    fetchExchangeRates();
    fetchCurrencies();
  }, [fetchUserInfo, fetchExchangeRates, fetchCurrencies]);

  useEffect(() => {
    if (userRole && (userRole === "guest" || userPreferredCurrency)) {
      fetchWishlistItems();
    }
  }, [userRole, userPreferredCurrency, fetchWishlistItems]);

  const handleRemoveFromWishlist = async (productId) => {
    if (!productId) {
      console.error("No product ID provided for removal");
      return;
    }

    try {
      const token = Cookies.get("jwt");
      if (!token) {
        setActionError("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:4000/tourist/remove/wishlist/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to remove item from wishlist");
      }
      setWishlistItems(
        wishlistItems.filter((item) => item.product._id !== productId)
      );
      setActionSuccess("Item removed from wishlist successfully!");
    } catch (error) {
      setActionError("Error removing item from wishlist. Please try again.");
      console.error("Error removing item from wishlist:", error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!productId) {
      console.error("No product ID provided for adding to cart");
      return;
    }

    try {
      const token = Cookies.get("jwt");
      if (!token) {
        setActionError("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:4000/tourist/move/wishlist/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }
      setActionSuccess("Item added to cart successfully!");
      fetchWishlistItems();
    } catch (error) {
      setActionError("Error adding item to cart. Please try again.");
      console.error("Error adding item to cart:", error);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          Your wishlist is empty.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <CardHeader>
                <CardTitle
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate(`/product/${item.product._id}`)}
                >
                  {item.product.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={
                    item.product.pictures[0] ||
                    "/placeholder.svg?height=192&width=256"
                  }
                  alt={item.product.name}
                  className="w-full h-48 object-cover mb-4 cursor-pointer rounded-md"
                  onClick={() => navigate(`/product/${item.product._id}`)}
                />
                <p className="text-xl font-semibold mb-2">
                  {item.formattedPrice}
                </p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {item.product.description}
                </p>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleRemoveFromWishlist(item.product._id)}
                  >
                    Remove
                  </Button>
                  <Button onClick={() => handleAddToCart(item.product._id)}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={actionSuccess !== null}
        onOpenChange={() => setActionSuccess(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                Success
              </div>
            </DialogTitle>
            <DialogDescription>{actionSuccess}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setActionSuccess(null)}>Close</Button>
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
              <div className="flex items-center">
                <XCircle className="w-6 h-6 text-red-500 mr-2" />
                Error
              </div>
            </DialogTitle>
            <DialogDescription>{actionError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setActionError(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WishlistPage;
