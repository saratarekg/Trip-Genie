import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you're using a UI library

export function CategoryCRUD() {

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [oldCategory, setOldCategory] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showUpdateCategory, setShowUpdateCategory] = useState(false);
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [showCategoriesList, setShowCategoriesList] = useState(false); // State for categories list visibility

  // Fetch categories when the component mounts
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
    fetchCategories();
  }, []);

  // Function to create a new category
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
          setMessage('Category updated successfully!');
          fetchCategories(); // Refresh the categories list
          resetButtons();
        } else {
          setMessage('Category not found.');
        }
      } catch (error) {
        console.error('Error updating category:', error.response?.data || error.message);
        setMessage('Error updating category');
      }
    } else {
      setMessage('Please provide old and new category names.');
    }
  };

  // Function to delete a category
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
          setMessage('Category deleted successfully!');
          fetchCategories(); // Refresh the categories list
          resetButtons();
        } else {
          setMessage('Category not found.');
        }
      } catch (error) {
        console.error('Error deleting category:', error.response?.data || error.message);
        setMessage('Error deleting category');
      }
    } else {
      setMessage('Please enter the category name you want to delete');
    }
  };

  // Reset button visibility after submitting or canceling
  const resetButtons = () => {
    setShowCreateCategory(false);
    setShowUpdateCategory(false);
    setShowDeleteCategory(false);
    setButtonsVisible(true);
    setShowCategoriesList(false); // Reset categories list visibility
    setMessage('');
  };

  // Handle showing the categories list
  const handleGetCategories = async () => {
    await fetchCategories(); // Fetch categories
    setShowCategoriesList(true); // Show categories list
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
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

      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg relative">
            <button
              onClick={() => {
                setIsModalVisible(false);
                setMessage('');
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
                      setButtonsVisible(false);
                      setMessage('');
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Create Category
                  </Button>

                  <Button
                    onClick={handleGetCategories} // Fetch categories and show list
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Get Categories
                  </Button>

                  <Button
                    onClick={() => {
                      setShowUpdateCategory(true);
                      setButtonsVisible(false);
                      setMessage('');
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

              {/* Display List of Categories */}
              {showCategoriesList && categories.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Categories List:</h3>
                  <ul className="list-disc pl-5">
                    {categories.map((category) => (
                      <li key={category._id} className="text-gray-700">
                        {category.name}
                      </li>
                    ))}
                  </ul>
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
