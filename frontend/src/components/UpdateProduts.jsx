import React, { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { ChevronLeft, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const UpdateProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:4000/${userRole}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const productData = await response.json();
        setProduct({
          name: productData.name,
          price: productData.price.toString(),
          description: productData.description,
        });
        setError(null);
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    return (
      product.name.trim() !== '' &&
      product.description.trim() !== '' &&
      product.price !== '' &&
      !isNaN(parseFloat(product.price)) &&
      parseFloat(product.price) >= 0
    );
  }, [product]);

  const handleUpdate = async () => {
    if (!isFormValid) {
      setError('Please fill in all fields correctly before updating.');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:4000/${userRole}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...product,
          price: parseFloat(product.price),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      setShowSuccessPopup(true);
      setError(null);
    } catch (err) {
      setError('Error updating product. Please try again later.');
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Update Product</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className={product.name.trim() === '' ? 'border-red-500' : ''}
                />
                {product.name.trim() === '' && (
                  <p className="text-red-500 text-sm mt-1">Name is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={product.price}
                  onChange={handleChange}
                  className={product.price === '' || isNaN(parseFloat(product.price)) || parseFloat(product.price) < 0 ? 'border-red-500' : ''}
                />
                {(product.price === '' || isNaN(parseFloat(product.price)) || parseFloat(product.price) < 0) && (
                  <p className="text-red-500 text-sm mt-1">Price must be a non-negative number</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={5}
                  className={product.description.trim() === '' ? 'border-red-500' : ''}
                />
                {product.description.trim() === '' && (
                  <p className="text-red-500 text-sm mt-1">Description is required</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end"> {/* Use justify-end to align items to the right */}
            <Button  variant="default" onClick={handleUpdate} disabled={!isFormValid}>
              Update Product
            </Button>
          </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Check className="w-6 h-6 text-green-500 mr-2" />
              Product Updated
            </DialogTitle>
            <DialogDescription>
              The product has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate('/all-products')}>
              Back to All Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateProduct;