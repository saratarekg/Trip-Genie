"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editTagId, setEditTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showTags, setShowTags] = useState(true);

  const fetchTags = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await axios.get('http://localhost:4000/admin/tags', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching Tags:', error);
      setMessage('Error fetching Tags');
      hideMessageAfterDelay(setMessage);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const hideMessageAfterDelay = (setMessageFunction) => {
    setTimeout(() => {
      setMessageFunction('');
    }, 3000);
  };

  const createTag = async () => {
    setMessage('');
    if (newTag) {
      try {
        const token = Cookies.get('jwt');
        await axios.post('http://localhost:4000/admin/tags', { type: newTag }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNewTag('');
        setSuccessMessage('Tag created successfully!');
        fetchTags();
        setShowCreateTag(false);
        hideMessageAfterDelay(setSuccessMessage);
      } catch (error) {
        setMessage('This tag already exists.');
        hideMessageAfterDelay(setMessage);
      }
    } else {
      setMessage('Please enter a tag name.');
      hideMessageAfterDelay(setMessage);
    }
  };

  const updateTag = async () => {
    setEditErrorMessage('');
    if (editTagName) {
      try {
        const token = Cookies.get('jwt');
        await axios.put(`http://localhost:4000/admin/tags/${editTagId}`, { type: editTagName }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage('Tag updated successfully!');
        setEditTagId(null);
        setEditTagName('');
        fetchTags();
        hideMessageAfterDelay(setSuccessMessage);
      } catch (error) {
        setEditErrorMessage('Tag name already exists');
        hideMessageAfterDelay(setEditErrorMessage);
      }
    } else {
      setEditErrorMessage('Please provide a valid tag name.');
      hideMessageAfterDelay(setEditErrorMessage);
    }
  };

  const deleteTag = async (tagId) => {
    setMessage('');
    try {
      const token = Cookies.get('jwt');
      await axios.delete(`http://localhost:4000/admin/tags/${tagId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage('Tag deleted successfully!');
      fetchTags();
      hideMessageAfterDelay(setSuccessMessage);
    } catch (error) {
      console.error('Error deleting tag:', error.response?.data || error.message);
      setMessage('Error deleting tag');
      hideMessageAfterDelay(setMessage);
    }
  };

  const handleDeleteClick = (tag) => {
    setTagToDelete(tag);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete._id);
      setShowDeleteModal(false);
      setTagToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowCreateTag(false);
    setNewTag('');
  };

  return (
    <div className="min-h-screen bg-[#E6DCCF]">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h1 className="text-2xl font-bold text-[#003f66] mb-6">
            Manage Tags
          </h1>

          <div className="space-y-4">
            {!showCreateTag && (
              <Button 
                onClick={() => setShowCreateTag(true)} 
                className="w-full bg-[#5D9297] hover:bg-[#388A94] text-white"
              >
                Create New Tag
              </Button>
            )}

            {showCreateTag && (
              <div className="space-y-4">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter new tag name"
                  className="border-[#808080]"
                />
                <div className="flex space-x-2">
                  <Button 
                    onClick={createTag} 
                    className="flex-1 bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] 
                    active:transform active:scale-95 text-white transition-all duration-200"
                  >
                    Add Tag
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

            <div className="mt-6">
              <div className="space-y-3">
                {tags.map((tag) => (
                  <div 
                    key={tag._id} 
                    className="flex justify-between items-center border border-gray-300 p-3 rounded-lg hover:shadow-md"
                  >
                    {editTagId === tag._id ? (
                      <div className="flex-1 mr-2">
                        <Input
                          type="text"
                          value={editTagName}
                          onChange={(e) => setEditTagName(e.target.value)}
                          className="border-[#808080]"
                        />
                      </div>
                    ) : (
                      <span className="text-[#003f66] font-medium">{tag.type}</span>
                    )}
                    
                    <div className="flex space-x-2">
                      {editTagId === tag._id ? (
                        <>
                          <Button
                            onClick={updateTag}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditTagId(null);
                              setEditTagName('');
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
                              setEditTagId(tag._id);
                              setEditTagName(tag.type);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-w-full !bg-white !text-[#2D6F77] border !border-[#2D6F77] 
                    hover:!bg-[#2D6F77] hover:!text-white active:!bg-[#1A3B47] 
                    active:transform active:scale-95 transition-all duration-200"
                    variant="outline"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(tag)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {message && (
              <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
                {message}
              </div>
            )}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#003f66]">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-[#003f66]">
              Are you sure you want to delete the tag "{tagToDelete?.type}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
            <Button
              onClick={() => setShowDeleteModal(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagsPage;