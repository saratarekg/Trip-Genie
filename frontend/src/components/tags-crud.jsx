"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function TagCRUD({ isOpen, onClose }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editTagId, setEditTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [message, setMessage] = useState(''); // General message (e.g., success messages)
  const [editErrorMessage, setEditErrorMessage] = useState(''); // Edit specific error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showTags, setShowTags] = useState(false);

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
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const hideMessageAfterDelay = (setMessageFunction) => {
    setTimeout(() => {
      setMessageFunction('');
    }, 3000); // Clear the message after 3 seconds
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
    setEditErrorMessage(''); // Reset edit error message
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
        console.error('Error updating tag:', error.response?.data || error.message);
        setEditErrorMessage('Tag name already exists');
        hideMessageAfterDelay(setEditErrorMessage); // Display specific error message in edit modal
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
    setShowTags(false);
    setNewTag('');
  };

  return (
    <>
      <DialogContent className="sm:max-w-[425px] p-6 bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-blue-900">Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pb-5 text-blue-900">
          {!showCreateTag && !showTags && (
            <>
              <Button 
                onClick={() => setShowCreateTag(true)} 
                className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600 transition duration-150">
                Create Tag
              </Button>
              <Button 
                onClick={() => setShowTags(true)} 
                className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600 transition duration-150">
                View Tags
              </Button>
            </>
          )}

          {showCreateTag && (
            <div className="space-y-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter new tag name"
                className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-blue-900"
              />
              <Button 
                onClick={createTag} 
                className="w-full mt-2 bg-green-500 text-white hover:bg-green-600 transition duration-150">
                Add Tag
              </Button>
              <Button 
                onClick={handleCancel} 
                className="w-full mt-2 bg-gray-500 text-white hover:bg-gray-600 transition duration-150">
                Cancel
              </Button>
            </div>
          )}

          {showTags && (
            <div className="mt-4 max-h-[350px] overflow-y-auto">
              <Button
                onClick={() => setShowTags(false)}
                className="w-full mt-4 bg-orange-500 text-white hover:bg-gray-600 transition duration-150"
              >
                Hide Tags
              </Button>
              {tags.length > 0 ? (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div 
                      key={tag._id} 
                      className="flex justify-between items-center border border-gray-300 p-3 rounded-lg hover:shadow-md transition-all duration-150">
                      <span className="text-blue-900 font-medium">{tag.type}</span>
                      <div className="space-x-2">
                        <Button
                          onClick={() => {
                            setEditTagId(tag._id);
                            setEditTagName(tag.type);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white transition duration-150">
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(tag)}
                          className="bg-red-500 hover:bg-red-600 text-white transition duration-150">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-900">No tags available.</p>
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

        {/* Edit Tag Modal */}
        {editTagId && (
          <Dialog open={!!editTagId} onOpenChange={() => setEditTagId(null)}>
            <DialogContent className="sm:max-w-[425px] p-6 bg-white shadow-lg rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-blue-900">Edit Tag</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                placeholder="Enter new tag name"
                className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-blue-900"
              />
              {editErrorMessage && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
                  {editErrorMessage}
                </div>
              )}
              <div className="flex space-x-2 mt-4">
                <Button onClick={updateTag} className="bg-orange-500 text-white hover:bg-orange-600 w-full transition duration-150">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditTagId(null);
                    setEditTagName('');
                    setEditErrorMessage(''); // Clear error message when canceling
                  }}
                  className="bg-gray-500 text-white hover:bg-gray-600 w-full transition duration-150"
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-blue-900">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-blue-700">
              Are you sure you want to delete the tag "{tagToDelete?.type}"?
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
