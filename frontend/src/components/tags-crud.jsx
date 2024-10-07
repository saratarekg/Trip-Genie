"use client"; // Ensure client-side rendering

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function TagCRUD({ isOpen, onClose }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editTagId, setEditTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

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
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      } catch (error) {
        setMessage('Error creating tags');
      }
    } else {
      setMessage('Please enter a tag name.');
    }
  };

  const updateTag = async () => {
    setMessage('');
    if (editTagName) {
      try {
        const token = Cookies.get('jwt');
        await axios.put(`http://localhost:4000/admin/tags/${editTagId}`, { type: editTagName }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage('Tag updated successfully!');
        setEditTagId(null); // Close the edit modal
        setEditTagName(''); // Reset the input field
        fetchTags();
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      } catch (error) {
        console.error('Error updating tag:', error.response?.data || error.message);
        setMessage('Error updating tag');
      }
    } else {
      setMessage('Please provide a valid tag name.');
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
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Error deleting tag:', error.response?.data || error.message);
      setMessage('Error deleting tag');
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] p-6 bg-white shadow-lg rounded-lg">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">Manage Tags</DialogTitle>
        <DialogDescription className="text-gray-500">
          Create, edit, or delete tags.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pb-5">
        {/* Create Tag Section */}
        <div className="mb-4 ">
          <Input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter new tag name"
            className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Button 
            onClick={createTag} 
            className="w-full mt-2 bg-orange-500 text-white hover:bg-orange-600 transition duration-150">
            Create Tag
          </Button>
        </div>

        {/* Tags List */}
        <div className="max-h-64 overflow-y-auto pb-3 pr-2">
          {tags.length > 0 ? (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div 
                  key={tag._id} 
                  className="flex justify-between items-center border border-gray-300 p-3 rounded-lg hover:shadow-md transition-all duration-150">
                  <span className="text-black font-medium">{tag.type}</span>
                  <div className="space-x-2">
                    {/* Edit button */}
                    <Button
                      onClick={() => {
                        setEditTagId(tag._id);
                        setEditTagName(tag.type);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white transition duration-150">
                      Edit
                    </Button>

                    {/* Delete button */}
                    <Button
                      onClick={() => deleteTag(tag._id)}
                      className="bg-red-500 hover:bg-red-600 text-white transition duration-150">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tags available.</p>
          )}
        </div>

        {/* Edit Tag Modal */}
        {editTagId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <h3 className="font-bold mb-2">Edit Tag</h3>
              <Input
                type="text"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                placeholder="Enter new tag name"
                className="mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex space-x-2 mt-4">
                <Button onClick={updateTag} className="bg-orange-500 text-white hover:bg-orange-600 w-full transition duration-150">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditTagId(null); // Close modal
                    setEditTagName(''); // Reset input
                  }}
                  className="bg-gray-500 text-white hover:bg-gray-600 w-full transition duration-150"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

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
  );
}
