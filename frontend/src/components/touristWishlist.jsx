import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {CheckCircle, XCircle}  from "lucide-react";

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch('http://localhost:4000/tourist/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist items");
      }
      const data = await response.json();
      setWishlistItems(data);
      console.log(data);
    } catch (err) {
      setError("Error fetching wishlist items. Please try again later.");
      console.error("Error fetching wishlist items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(`http://localhost:4000/tourist/remove/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to remove item from wishlist");
      }
      setWishlistItems(wishlistItems.filter(item => item.product._id !== productId));
      setActionSuccess("Item removed from wishlist successfully!");
    } catch (error) {
      setActionError("Error removing item from wishlist. Please try again.");
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(`http://localhost:4000/tourist/move/wishlist/${productId}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }
      setActionSuccess("Item added to cart successfully!");
      fetchWishlistItems();
    } catch (error) {
      setActionError("Error adding item to cart. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map(item => (
            <Card key={item._id}>
              <CardHeader>
                <CardTitle className="cursor-pointer hover:underline" onClick={() => navigate(`/product/${item.product._id}`)}>
                  {item.product.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={item.product.pictures[0] || '/placeholder.svg'} 
                  alt={item.product.name} 
                  className="w-full h-48 object-cover mb-4 cursor-pointer"
                  onClick={() => navigate(`/product/${item.product._id}`)}
                />
                <p className="text-lg font-semibold mb-2">${item.product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mb-4">{item.product.description.substring(0, 100)}...</p>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => handleRemoveFromWishlist(item.product._id)}>
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

    <Dialog open={actionSuccess !== null} onOpenChange={() => setActionSuccess(null)}>
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

      {/* Action Error Dialog */}
      <Dialog open={actionError !== null} onOpenChange={() => setActionError(null)}>
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