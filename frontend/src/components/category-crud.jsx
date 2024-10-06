import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [successMessage, setSuccessMessage] = useState('');
  const [showCategoriesList, setShowCategoriesList] = useState(false);

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
        // Clear success message after 3 seconds
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
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
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
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
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

  const resetButtons = () => {
    setShowCreateCategory(false);
    setShowUpdateCategory(false);
    setShowDeleteCategory(false);
    setButtonsVisible(true);
    setMessage('');
  };

  const handleGetCategories = async () => {
    await fetchCategories();
    setShowCategoriesList(true);
  };

  // Function to clear success message when any button is clicked
  const handleButtonClick = () => {
    setSuccessMessage(''); // Clear success message when any button is pressed
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Button
        onClick={() => {
          setIsModalVisible(true);
          handleButtonClick(); // Clear success message
        }}
        className="w-60 h-[230px] bg-white rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none"
      >
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[32px] text-center tracking-[0] leading-[38.0px]">
          Manage
          <br />
          Categories
        </div>
      </Button>

      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Create, update, or delete categories here.
            </DialogDescription>
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
                    handleButtonClick(); // Clear success message
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
                    handleButtonClick(); // Clear success message
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create Category
                </Button>

                <Button
                  onClick={() => {
                    handleGetCategories();
                    handleButtonClick(); // Clear success message
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Get Categories
                </Button>

                <Button
                  onClick={() => {
                    setShowUpdateCategory(true);
                    setButtonsVisible(false);
                    setMessage('');
                    handleButtonClick(); // Clear success message
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
                    handleButtonClick(); // Clear success message
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
                    handleButtonClick(); // Clear success message
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
                    handleButtonClick(); // Clear success message
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
      </Dialog>

      <Dialog open={showCategoriesList} onOpenChange={setShowCategoriesList}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Categories List</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
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
            onClick={() => setShowCategoriesList(false)}
            className="w-full mt-4 bg-gray-500 text-white"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
