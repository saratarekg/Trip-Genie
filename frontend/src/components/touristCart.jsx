import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotalAmount(total);
  }, [cartItems]);

  const fetchCartItems = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch('http://localhost:4000/tourist/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
        console.log(productId);
        const token = Cookies.get("jwt");
      const response = await fetch(`http://localhost:4000/tourist/remove/cart/${productId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: productId }), // Send as an object with the productId key
        });
      if (response.ok) {
        setCartItems(cartItems.filter(item => item.product._id !== productId));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
        const token = Cookies.get("jwt");
      const response = await fetch(`http://localhost:4000/tourist/update/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({  newQuantity, productId }),
      });
      if (response.ok) {
        setCartItems(cartItems.map(item => 
          item.product._id === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCheckout = () => {
    setShowPurchaseConfirm(true);
  };

  const handlePurchase = async () => {
    try {
      const token = Cookies.get("jwt");
      let allPurchasesSuccessful = true;
  
      // Loop through each item in the cart
      for (const item of cartItems) {
        // Calculate total price for each item
        const totalPriceForItem = item.quantity * item.product.price;
  
        // Make a POST request for each individual item purchase
        const response = await fetch("http://localhost:4000/tourist/purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.product._id,  // The ID of the product
            quantity: item.quantity,      // Quantity of this product
            totalPrice: totalPriceForItem, // Total price for this specific item
            paymentMethod,                // Payment method selected by the user
          }),
        });
  
        // Check if the response is OK for each item
        if (!response.ok) {
          console.error(`Failed to purchase item: ${item.product.name}`);
          allPurchasesSuccessful = false;
          break; // Exit the loop if any purchase fails
        }
      }
  
      // If all purchases were successful, proceed to clear the cart
      if (allPurchasesSuccessful) {
        // Clear the cart items in the local state
        setCartItems([]);
        setShowPurchaseConfirm(false);
        setPaymentMethod('');
  
        alert('Purchase successful!');
  
        // Now, make the call to the empty cart API
        const emptyCartResponse = await fetch("http://localhost:4000/tourist/empty/cart", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (emptyCartResponse.ok) {
          console.log('Cart emptied successfully.');
        } else {
          console.error('Failed to empty the cart.');
        }
      } else {
        console.error('Failed to complete purchase for some items.');
      }
    } catch (error) {
      console.error('Error making purchase:', error);
    }
  };
  

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 my-8">No items in cart</p>
      ) : (
        cartItems.map(item => (
          <div key={item._id} className="flex items-center justify-between border-b py-4">
            <div className="flex items-center">
              <img 
                src={item?.product?.pictures?.length ? item.product.pictures[0] : '/placeholder.svg'} 
                alt={item?.product?.name || 'Product'} 
                className="w-20 h-20 object-cover mr-4 cursor-pointer"
                onClick={() => handleProductClick(item.product._id)}
              />
              <div>
                {item.product ? (
                  <>
                    <h2 
                      className="text-lg font-semibold cursor-pointer hover:underline"
                      onClick={() => handleProductClick(item.product._id)}
                    >
                      {item.product.name}
                    </h2>
                    <p className="text-sm text-gray-600">{item.product.description}</p>
                  </>
                ) : (
                  <p>Product is not available</p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                className="px-2 py-1 bg-gray-200 rounded-l"
              >
                -
              </button>
              <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
              <button 
                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                className="px-2 py-1 bg-gray-200 rounded-r"
              >
                +
              </button>
              <span className="ml-4 font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
              <button 
                onClick={() => handleRemoveItem(item.product._id)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
      {cartItems.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <div className="text-xl font-bold">
            Total: ${totalAmount.toFixed(2)}
          </div>
          <Button onClick={handleCheckout} disabled={cartItems.length === 0}>
            Checkout
          </Button>
        </div>
      )}

      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Total Amount: ${totalAmount.toFixed(2)}
              <br />
              Number of Items: {cartItems.length}
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
            <Button
              variant="outline"
              onClick={() => {
                setShowPurchaseConfirm(false);
                setPaymentMethod("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handlePurchase();
                setShowPurchaseConfirm(false);
                setPaymentMethod("");
              }}
              disabled={!paymentMethod}
            >
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingCart;