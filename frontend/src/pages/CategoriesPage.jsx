"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast"; // Import Toast components
import DeleteConfirmation from "@/components/ui/deletionConfirmation";

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
  const [isToastOpen, setIsToastOpen] = useState(false); // State for toast
  const [toastMessage, setToastMessage] = useState(''); // State for toast message
  const [toastType, setToastType] = useState(''); // State for toast type

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
      setToastMessage('Error fetching categories');
      setToastType('error');
      setIsToastOpen(true);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isToastOpen) {
      const timer = setTimeout(() => {
        setIsToastOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isToastOpen]);

  const hideMessageAfterDelay = (setMessageFunction) => {
    setTimeout(() => {
      setMessageFunction("");
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
        setToastMessage('Category created successfully!');
        setToastType('success');
        setIsToastOpen(true);
        fetchCategories();
        setShowCreateCategory(false);
        hideMessageAfterDelay(setSuccessMessage);
      } catch (error) {
        setMessage("This category already exists");
        setToastMessage('This category already exists');
        setToastType('error');
        setIsToastOpen(true);
        hideMessageAfterDelay(setMessage);
      }
    } else {
      setMessage("Please enter a category name.");
      setToastMessage('Please enter a category name.');
      setToastType('error');
      setIsToastOpen(true);
      hideMessageAfterDelay(setMessage);
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
        setToastMessage('Category updated successfully!');
        setToastType('success');
        setIsToastOpen(true);
        setSelectedCategoryId(null);
        fetchCategories();
        hideMessageAfterDelay(setSuccessMessage);
      } catch (error) {
        setEditErrorMessage("Category name already exists");
        setToastMessage('Category name already exists');
        setToastType('error');
        setIsToastOpen(true);
        hideMessageAfterDelay(setEditErrorMessage);
      }
    } else {
      setEditErrorMessage("Please enter a new category name.");
      setToastMessage('Please enter a new category name.');
      setToastType('error');
      setIsToastOpen(true);
      hideMessageAfterDelay(setEditErrorMessage);
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
      setToastMessage('Category deleted successfully!');
      setToastType('success');
      setIsToastOpen(true);
      fetchCategories();
      hideMessageAfterDelay(setSuccessMessage);
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage("Error deleting category");
      setToastMessage('Error deleting category');
      setToastType('error');
      setIsToastOpen(true);
      hideMessageAfterDelay(setMessage);
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

  const handleCancel = () => {
    setShowCreateCategory(false);
    setNewCategory('');
  };

  return (
    <div className="min-h-screen p-6">
      <ToastProvider>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            {!showCreateCategory ? (
              <Button 
                onClick={() => setShowCreateCategory(true)} 
                className="w-full bg-[#5D9297] hover:bg-[#388A94] text-white"
              >
                Create New Category
              </Button>
            ) : (
              <div className="space-y-4">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="border-[#808080]"
                />
                <div className="flex space-x-2">
                  <Button 
                    onClick={createCategory} 
                    className="flex-1 bg-[#F88C33] hover:bg-orange-500 active:bg-[#2D6F77] 
                    active:transform active:scale-95 text-white transition-all duration-200"
                  >
                    Add Category
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div 
                key={category._id} 
                className="bg-white border border-gray-300 p-4 rounded-lg hover:shadow-md flex items-center justify-between"
              >
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[#003f66] font-medium">{category.name}</span>
                  <span className="text-gray-500 text-sm self-start text-right mr-8">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setSelectedCategoryId(category._id);
                      setUpdatedCategory(category.name);
                    }}
                    className="p-2 bg-[#B5D3D1] text-[#2D6F77] border border-[#2D6F77] 
                    hover:bg-[#2D6F77] hover:text-white active:bg-[#1A3B47] 
                    active:transform active:scale-95 transition-all duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(category)}
                    className="p-2 bg-red-100 text-red-500 hover:bg-red-200 hover:text-white transition duration-300 ease-in-out"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DeleteConfirmation
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          itemType="category"
          onConfirm={handleConfirmDelete}
        />

        {/* Edit Category Dialog */}
        {selectedCategoryId && (
          <Dialog open={!!selectedCategoryId} onOpenChange={() => setSelectedCategoryId(null)}>
            <DialogContent className="sm:max-w-[500px] p-6 bg-white shadow-lg rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-[#003f66]">Edit Category</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                value={updatedCategory}
                onChange={(e) => setUpdatedCategory(e.target.value)}
                className="border-[#808080] mb-2"
              />
              {editErrorMessage && (
                <p className="text-red-500 text-sm mb-2">{editErrorMessage}</p>
              )}
              <DialogFooter className="sm:justify-start">
                <Button
                  onClick={handleUpdateCategory}
                  className="bg-[#F88C33] hover:bg-orange-500 text-white"
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
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <ToastViewport className="fixed bottom-0 right-0 p-4" />
        {isToastOpen && (
          <Toast
            onOpenChange={setIsToastOpen}
            open={isToastOpen}
            duration={2000}
            className={toastType === 'success' ? 'bg-green-100' : 'bg-red-100'}
          >
            <div className="flex items-center">
              {toastType === 'success' ? (
                <CheckCircle className="text-green-500 mr-2" />
              ) : (
                <XCircle className="text-red-500 mr-2" />
              )}
              <div>
                <ToastTitle>{toastType === 'success' ? 'Success' : 'Error'}</ToastTitle>
                <ToastDescription>
                  {toastMessage}
                </ToastDescription>
              </div>
            </div>
            <ToastClose />
          </Toast>
        )}
      </ToastProvider>
    </div>
  );
}
