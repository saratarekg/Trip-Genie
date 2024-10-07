"use client"; // Ensure client-side rendering

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CategoryCRUD({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCategories = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await axios.get('http://localhost:4000/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage('Error fetching categories');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const createCategory = async () => {
    setMessage('');
    if (newCategory) {
      try {
        const token = Cookies.get('jwt');
        await axios.post('http://localhost:4000/admin/categories', { name: newCategory }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNewCategory('');
        setSuccessMessage('Category created successfully!');
        fetchCategories();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setMessage('Error creating category');
      }
    } else {
      setMessage('Please enter a category name.');
    }
  };

  const handleUpdateCategory = async () => {
    setMessage('');
    if (updatedCategory) {
      try {
        const token = Cookies.get('jwt');
        await axios.put(`http://localhost:4000/admin/categories/${selectedCategoryId}`, 
        { name: updatedCategory }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUpdatedCategory('');
        setSuccessMessage('Category updated successfully!');
        fetchCategories();
        setShowEditModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setMessage('Error updating category');
      }
    } else {
      setMessage('Please enter a new category name.');
    }
  };

  const deleteCategory = async (categoryId) => {
    setMessage('');
    try {
      const token = Cookies.get('jwt');
      await axios.delete(`http://localhost:4000/admin/categories/${categoryId}`,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage('Category deleted successfully!');
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting category');
    }
  };

  const handleEditClick = (categoryId, currentName) => {
    setSelectedCategoryId(categoryId);
    setUpdatedCategory(currentName);
    setShowEditModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <DialogContent className="sm:max-w-[425px] p-6 bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Manage Categories</DialogTitle>
        </DialogHeader>

        {/* Create Category */}
        <div className="space-y-4">
          <Input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category name"
            className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Button
            onClick={createCategory}
            className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600 transition duration-150"
          >
            Create Category
          </Button>

          {/* Categories List */}
          <div className="mt-4 max-h-[350px] overflow-y-auto">
            {categories.length > 0 ? (
              <ul className="list-none p-0">
                {categories.map((category) => (
                  <li 
                    key={category._id} 
                    className="flex justify-between items-center text-gray-700 border border-gray-300 rounded-lg py-2 px-4 mb-1 hover:shadow-md transition"
                  >
                    <span>{category.name}</span>
                    <div className="space-x-2">
                      <Button
                        onClick={() => handleEditClick(category._id, category.name)}
                        className="bg-blue-500 text-white hover:bg-blue-600 transition duration-150"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteCategory(category._id)}
                        className="bg-red-500 text-white hover:bg-red-600 transition duration-150"
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No categories found.</p>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
              {message}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
              {successMessage}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Edit Category Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Category</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={updatedCategory}
            onChange={(e) => setUpdatedCategory(e.target.value)}
            placeholder="New category name"
            className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Button
            onClick={handleUpdateCategory}
            className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600 transition duration-150"
          >
            Save Changes
          </Button>
          <Button
            onClick={() => setShowEditModal(false)}
            className="w-full mt-2 bg-gray-500 text-white hover:bg-gray-600 transition duration-150"
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
