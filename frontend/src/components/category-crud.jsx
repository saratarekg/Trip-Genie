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
  const [oldCategory, setOldCategory] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showUpdateCategory, setShowUpdateCategory] = useState(false);
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

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
        resetButtons();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setMessage('Error creating category');
      }
    } else {
      setMessage('Please enter a category name.');
    }
  };

  const updateCategory = async () => {
    setMessage('');
    if (oldCategory && updatedCategory) {
      try {
        const token = Cookies.get('jwt');
        const url = `http://localhost:4000/admin/categoriesName?name=${oldCategory}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const category = response.data;

        if (category && category._id) {
          await axios.put(`http://localhost:4000/admin/categories/${category._id}`, 
          { name: updatedCategory }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOldCategory('');
          setUpdatedCategory('');
          setSuccessMessage('Category updated successfully!');
          fetchCategories();
          resetButtons();
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setMessage('Category not found.');
        }
      } catch (error) {
        setMessage('Error updating category');
      }
    } else {
      setMessage('Please provide old and new category names.');
    }
  };

  const deleteCategory = async () => {
    setMessage('');
    if (oldCategory) {
      try {
        const token = Cookies.get('jwt');
        const url = `http://localhost:4000/admin/categoriesName?name=${oldCategory}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const category = response.data;

        if (category && category._id) {
          await axios.delete(`http://localhost:4000/admin/categories/${category._id}`,  {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOldCategory('');
          setSuccessMessage('Category deleted successfully!');
          fetchCategories();
          resetButtons();
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setMessage('Category not found.');
        }
      } catch (error) {
        setMessage('Error deleting category');
      }
    } else {
      setMessage('Please enter the category name you want to delete');
    }
  };

  const resetButtons = () => {
    setShowCreateCategory(false);
    setShowUpdateCategory(false);
    setShowDeleteCategory(false);
    setButtonsVisible(true);
    setMessage('');
  };

  const handleGetCategories = async () => {
    await fetchCategories();
    setIsCategoriesModalOpen(true); // Open categories popout
  };

  const handleButtonClick = () => {
    setSuccessMessage('');
  };

  if (!isOpen) return null;

  return (
    <>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {showCreateCategory && (
            <div>
              <Input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                className="mt-2"
              />
              <Button
                onClick={() => {
                  createCategory();
                  handleButtonClick();
                }}
                className="w-full mt-2 bg-green-500 text-white"
              >
                Submit
              </Button>
              <Button
                onClick={resetButtons}
                className="w-full mt-2 bg-gray-500 text-white"
              >
                Cancel
              </Button>
            </div>
          )}

          {buttonsVisible && (
            <>
              <Button
                onClick={() => {
                  setShowCreateCategory(true);
                  setButtonsVisible(false);
                  setMessage('');
                  handleButtonClick();
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Create Category
              </Button>

              <Button
                onClick={handleGetCategories}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Get Categories
              </Button>

              <Button
                onClick={() => {
                  setShowUpdateCategory(true);
                  setButtonsVisible(false);
                  setMessage('');
                  handleButtonClick();
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Update Category
              </Button>

              <Button
                onClick={() => {
                  setShowDeleteCategory(true);
                  setButtonsVisible(false);
                  setMessage('');
                  handleButtonClick();
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Delete Category
              </Button>
            </>
          )}

          {showUpdateCategory && (
            <div>
              <Input
                type="text"
                value={oldCategory}
                onChange={(e) => setOldCategory(e.target.value)}
                placeholder="Old category name"
                className="mt-2"
              />
              <Input
                type="text"
                value={updatedCategory}
                onChange={(e) => setUpdatedCategory(e.target.value)}
                placeholder="New category name"
                className="mt-2"
              />
              <Button
                onClick={() => {
                  updateCategory();
                  handleButtonClick();
                }}
                className="w-full mt-2 bg-green-500 text-white"
              >
                Submit
              </Button>
              <Button
                onClick={resetButtons}
                className="w-full mt-2 bg-gray-500 text-white"
              >
                Cancel
              </Button>
            </div>
          )}

          {showDeleteCategory && (
            <div>
              <Input
                type="text"
                value={oldCategory}
                onChange={(e) => setOldCategory(e.target.value)}
                placeholder="Category to delete"
                className="mt-2"
              />
              <Button
                onClick={() => {
                  deleteCategory();
                  handleButtonClick();
                }}
                className="w-full mt-2 bg-green-500 text-white"
              >
                Submit
              </Button>
              <Button
                onClick={resetButtons}
                className="w-full mt-2 bg-gray-500 text-white"
              >
                Cancel
              </Button>
            </div>
          )}

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

      {/* Categories Modal Popout */}
      <Dialog open={isCategoriesModalOpen} onOpenChange={setIsCategoriesModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Categories List</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[350px] overflow-y-auto">
            {categories.length > 0 ? (
              <ul className="list-disc pl-5">
                {categories.map((category) => (
                  <li key={category._id} className="text-gray-700">
                    {category.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No categories found.</p>
            )}
          </div>
          <Button
            onClick={() => setIsCategoriesModalOpen(false)}
            className="w-full mt-4 bg-gray-500 text-white"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
