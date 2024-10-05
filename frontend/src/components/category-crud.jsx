import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you're using a UI library

export function CategoryCRUD() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [oldCategory, setOldCategory] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); // Toggles modal visibility
  const [showCreateCategory, setShowCreateCategory] = useState(false); // For creating category
  const [showUpdateCategory, setShowUpdateCategory] = useState(false); // For updating category
  const [showDeleteCategory, setShowDeleteCategory] = useState(false); // For deleting category
  const [buttonsVisible, setButtonsVisible] = useState(true); // Manage buttons visibility
  const [message, setMessage] = useState(''); // For success/error messages

  // Fetch categories when the component mounts
  const fetchCategories = async () => {
    try {
      const token = Cookies.get('jwt'); // Replace with your actual token
      const response = await axios.get('http://localhost:4000/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to create a new category
  const createCategory = async () => {
    // Clear message when button is clicked
    setMessage('');  
    if (newCategory) {
      try {
        await axios.post('http://localhost:4000/admin/categories', { name: newCategory });
        setNewCategory('');
        setMessage('Category created successfully!');
        fetchCategories(); // Refresh the categories list
        resetButtons();
      } catch (error) {
        setMessage('Error creating category');
      }
    } else {
      setMessage('Please enter a category name.');
    }
  };

  // Function to update a category
  const updateCategory = async () => {
    // Clear message when button is clicked
    setMessage('');  
    if (oldCategory && updatedCategory) {
      try {
        await axios.put(`http://localhost:4000/admin/categories/${id}`, { name: updatedCategory });
        setOldCategory('');
        setUpdatedCategory('');
        setMessage('Category updated successfully!');
        fetchCategories(); // Refresh the categories list
        resetButtons();
      } catch (error) {
        setMessage('Error updating category');
      }
    } else {
      setMessage('Please provide old and new category names.');
    }
  };

  // Function to delete a category
  const deleteCategory = async () => {
    // Clear message when button is clicked
    setMessage('');  
    if (oldCategory) {
      try {
        await axios.delete(`http://localhost:4000/admin/categories/${id}`);
        setOldCategory('');
        setMessage('Category deleted successfully!');
        fetchCategories(); // Refresh the categories list
        resetButtons();
      } catch (error) {
        setMessage('Error deleting category');
      }
    } else {
      setMessage('Please enter a category name to delete.');
    }
  };

  // Reset button visibility after submitting or canceling
  const resetButtons = () => {
    setShowCreateCategory(false);
    setShowUpdateCategory(false);
    setShowDeleteCategory(false);
    setButtonsVisible(true); // Show the buttons again
    setMessage(''); // Clear the message when resetting buttons
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Manage Categories Button */}
      <Button
        onClick={() => setIsModalVisible(true)}
        className="w-60 h-[230px] bg-white rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none"
      >
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[32px] text-center tracking-[0] leading-[38.0px]">
          Manage
          <br />
          Categories
        </div>
      </Button>

      {/* Modal (Popout) */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg relative">
            {/* Close Button (X) */}
            <button
              onClick={() => {
                setIsModalVisible(false);
                setMessage(''); // Clear message when closing the modal
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-blue-900 mb-4">Manage Categories</h2>

            <div className="space-y-4">
              {/* Create Category */}
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
                    onClick={createCategory}
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

              {/* Buttons Section (Hidden when one is clicked) */}
              {buttonsVisible && (
                <>
                  <Button
                    onClick={() => {
                      setShowCreateCategory(true);
                      setButtonsVisible(false); // Hide buttons
                      setMessage(''); // Clear message when starting to create category
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Create Category
                  </Button>

                  <Button
                    onClick={fetchCategories}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Get Categories
                  </Button>

                  <Button
                    onClick={() => {
                      setShowUpdateCategory(true);
                      setButtonsVisible(false); // Hide buttons
                      setMessage(''); // Clear message when starting to update category
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Update Category
                  </Button>

                  <Button
                    onClick={() => {
                      setShowDeleteCategory(true);
                      setButtonsVisible(false); // Hide buttons
                      setMessage(''); // Clear message when starting to delete category
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Delete Category
                  </Button>
                </>
              )}

              {/* Update Category */}
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
                    onClick={updateCategory}
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

              {/* Delete Category */}
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
                    onClick={deleteCategory}
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

              {/* Message Display */}
              {message && (
                <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
