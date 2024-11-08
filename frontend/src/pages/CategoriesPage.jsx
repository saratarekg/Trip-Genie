"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [message, setMessage] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        "http://localhost:4000/admin/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage("Error fetching categories");
      hideErrorMessageAfterDelay();
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const hideErrorMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage("");
      setEditErrorMessage("");
    }, 3000);
  };

  const createCategory = async () => {
    setMessage("");
    if (newCategory) {
      try {
        const token = Cookies.get("jwt");
        await axios.post(
          "http://localhost:4000/admin/categories",
          { name: newCategory },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNewCategory("");
        setSuccessMessage("Category created successfully!");
        fetchCategories();
        setShowCreateCategory(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        setMessage("This category already exists");
        hideErrorMessageAfterDelay();
      }
    } else {
      setMessage("Please enter a category name.");
      hideErrorMessageAfterDelay();
    }
  };

  const handleUpdateCategory = async () => {
    setEditErrorMessage("");
    if (updatedCategory) {
      try {
        const token = Cookies.get("jwt");
        await axios.put(
          `http://localhost:4000/admin/categories/${selectedCategoryId}`,
          { name: updatedCategory },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUpdatedCategory("");
        setSuccessMessage("Category updated successfully!");
        setSelectedCategoryId(null);
        fetchCategories();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        setEditErrorMessage("Category name already exists");
        hideErrorMessageAfterDelay();
      }
    } else {
      setEditErrorMessage("Please enter a new category name.");
      hideErrorMessageAfterDelay();
    }
  };

  const deleteCategory = async (categoryId) => {
    setMessage("");
    try {
      const token = Cookies.get("jwt");
      await axios.delete(
        `http://localhost:4000/admin/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage("Category deleted successfully!");
      fetchCategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setMessage("Error deleting category");
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
    setEditErrorMessage("");
    setShowEditModal(true);
  };

  return (
    <div className="bg-[#E6DCCF]">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>

      <div className="container mx-auto px-4 pt-4 pb-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-[#003f66] mb-4">
            Manage Categories
          </h1>

          <div className="space-y-4">
            {!showCreateCategory && (
              <Button
                onClick={() => setShowCreateCategory(true)}
                className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] 
                active:transform active:scale-95 text-white transition-all duration-200"
              >
                Create Category
              </Button>
            )}

            {showCreateCategory && (
              <div className="border rounded-lg p-4">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="mb-2"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={createCategory}
                    className="w-1/2 bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] 
                    active:transform active:scale-95 text-white transition-all duration-200"
                  >
                    Add Category
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateCategory(false);
                      setNewCategory('');
                    }}
                    className="w-1/2 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 
                    active:transform active:scale-95 text-white transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded-lg">
              {categories.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <li
                      key={category._id}
                      className="flex justify-between items-center p-4"
                    >
                      {selectedCategoryId === category._id ? (
                        <div className="flex-1 mr-2">
                          <Input
                            type="text"
                            value={updatedCategory}
                            onChange={(e) => setUpdatedCategory(e.target.value)}
                            className="border-[#808080]"
                          />
                        </div>
                      ) : (
                        <span className="text-[#003f66] font-medium">{category.name}</span>
                      )}
                      <div className="flex space-x-2">
                        {selectedCategoryId === category._id ? (
                          <>
                            <Button
                              onClick={handleUpdateCategory}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedCategoryId(null);
                                setUpdatedCategory('');
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-white"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                setSelectedCategoryId(category._id);
                                setUpdatedCategory(category.name);
                              }}
                              className="w-full !bg-white !text-[#2D6F77] border !border-[#2D6F77] 
                              hover:!bg-[#2D6F77] hover:!text-white active:!bg-[#1A3B47] 
                              active:transform active:scale-95 transition-all duration-200"
                              variant="outline"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(category)}
                              className="p-2 bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-900 p-4">No categories found.</p>
              )}
            </div>

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
        </div>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </Button>
            <Button
              onClick={() => setShowDeleteModal(false)}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
