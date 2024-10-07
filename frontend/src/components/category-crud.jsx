"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function CategoryCRUD({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [message, setMessage] = useState(''); // For general error messages
  const [editErrorMessage, setEditErrorMessage] = useState(''); // For Edit modal-specific errors
  const [successMessage, setSuccessMessage] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

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
      hideErrorMessageAfterDelay();
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const hideErrorMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage('');
      setEditErrorMessage('');
    }, 3000); // Clear the message after 3 seconds
  };

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
        setShowCreateCategory(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setMessage('This category already exists');
        hideErrorMessageAfterDelay();
      }
    } else {
      setMessage('Please enter a category name.');
      hideErrorMessageAfterDelay();
    }
  };

  const handleUpdateCategory = async () => {
    setEditErrorMessage(''); // Reset error message for the Edit modal
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
        setShowEditModal(false); // Close modal on success
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setEditErrorMessage('Category name already exists'); // Set error for Edit modal
        hideErrorMessageAfterDelay();
      }
    } else {
      setEditErrorMessage('Please enter a new category name.');
      hideErrorMessageAfterDelay();
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
      hideErrorMessageAfterDelay();
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete._id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleEditClick = (categoryId, currentName) => {
    setSelectedCategoryId(categoryId);
    setUpdatedCategory(currentName);
    setEditErrorMessage(''); // Reset error when opening modal
    setShowEditModal(true);
  };

  const toggleCategoriesVisibility = () => {
    setShowCategories(true);
    setShowCreateCategory(false);
    fetchCategories();
  };

  const toggleCreateCategoryVisibility = () => {
    setShowCreateCategory(true);
    setShowCategories(false);
  };

  const handleCancel = () => {
    setShowCreateCategory(false);
    setShowCategories(false);
    setNewCategory('');
  };

  if (!isOpen) return null;

  return (
    <>
      <DialogContent className="sm:max-w-[425px] p-6 bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-blue-900">Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-blue-900">
          {!showCreateCategory && !showCategories && (
            <>
              <Button
                onClick={toggleCreateCategoryVisibility}
                className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600 transition duration-150"
              >
                Create Category
              </Button>
              <Button
                onClick={toggleCategoriesVisibility}
                className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600 transition duration-150"
              >
                View Categories
              </Button>
            </>
          )}

          {showCreateCategory && (
            <div className="space-y-2">
              <Input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-blue-900"
              />
              <Button
                onClick={createCategory}
                className="w-full mt-2 bg-green-500 text-white hover:bg-green-600 transition duration-150"
              >
                Add Category
              </Button>
              <Button
                onClick={handleCancel}
                className="w-full mt-2 bg-gray-500 text-white hover:bg-gray-600 transition duration-150"
              >
                Cancel
              </Button>
            </div>
          )}

          {showCategories && (
            <div className="mt-4 max-h-[350px] overflow-y-auto">
              <Button
                onClick={handleCancel}
                className="w-full mt-4 bg-orange-500 text-white hover:bg-gray-600 transition duration-150"
              >
                Hide Categories
              </Button>

              {categories.length > 0 ? (
                <ul className="list-none p-0">
                  {categories.map((category) => (
                    <li
                      key={category._id}
                      className="flex justify-between items-center text-blue-900 border border-gray-300 rounded-lg py-2 px-4 mb-1 hover:shadow-md transition"
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
                          onClick={() => handleDeleteClick(category)}
                          className="bg-red-500 text-white hover:bg-red-600 transition duration-150"
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-900">No categories found.</p>
              )}
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

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-blue-900">Edit Category</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={updatedCategory}
            onChange={(e) => setUpdatedCategory(e.target.value)}
            placeholder="New category name"
            className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-blue-900"
          />
          {editErrorMessage && (
            <div className="mt-2 text-red-600 text-sm">
              {editErrorMessage}
            </div>
          )}
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

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-blue-900">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-blue-700">
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-500 text-white hover:bg-red-600 transition duration-150"
            >
              Delete
            </Button>
            <Button
              onClick={() => setShowDeleteModal(false)}
              className="bg-gray-500 text-white hover:bg-gray-600 transition duration-150"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
