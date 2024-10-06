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
  const [oldTag, setOldTag] = useState('');
  const [updatedTag, setUpdatedTag] = useState('');
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showUpdateTag, setShowUpdateTag] = useState(false);
  const [showDeleteTag, setShowDeleteTag] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showTagList, setShowTagList] = useState(false);

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
        resetButtons();
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
    if (oldTag && updatedTag) {
      try {
        const token = Cookies.get('jwt');
        const url = `http://localhost:4000/admin/tagbytype?type=${oldTag}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const tag = response.data;

        if (tag && tag._id) {
          await axios.put(`http://localhost:4000/admin/tags/${tag._id}`, 
          { type: updatedTag }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOldTag('');
          setUpdatedTag('');
          setSuccessMessage('Tag updated successfully!');
          fetchTags();
          resetButtons();
          setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        } else {
          setMessage('Tag not found.');
        }
      } catch (error) {
        console.error('Error updating tag:', error.response?.data || error.message);
        setMessage('Error updating tag');
      }
    } else {
      setMessage('Please provide old and new tag names.');
    }
  };

  const deleteTag = async () => {
    setMessage('');
    if (oldTag) {
      try {
        const token = Cookies.get('jwt');
        const url = `http://localhost:4000/admin/tagbytype?type=${oldTag}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const tag = response.data;

        if (tag && tag._id) {
          await axios.delete(`http://localhost:4000/admin/tags/${tag._id}`,  {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOldTag('');
          setSuccessMessage('Tag deleted successfully!');
          fetchTags();
          resetButtons();
          setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        } else {
          setMessage('Tag not found.');
        }
      } catch (error) {
        console.error('Error deleting tag:', error.response?.data || error.message);
        setMessage('Error deleting tag');
      }
    } else {
      setMessage('Please enter the tag name you want to delete');
    }
  };

  const resetButtons = () => {
    setShowCreateTag(false);
    setShowUpdateTag(false);
    setShowDeleteTag(false);
    setButtonsVisible(true);
    setMessage('');
  };

  const handleGetTags = async () => {
    await fetchTags();
    setShowTagList(true); // Show the tag list popout
  };
  const handleButtonClick = () => {
    setSuccessMessage('');
  };
  const TagListPopout = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full">
        <h3 className="font-bold mb-2">Tags List</h3>
        <div className="max-h-64 overflow-y-auto"> {/* Scrollable area */}
          {tags.length > 0 ? (
            <div className="flex flex-col">
              {tags.map((tag) => (
                <div
                  key={tag._id}
                  className="text-black p-2 m-1 border border-black rounded-lg" // Increased border thickness
                >
                  {tag.type}
                </div>
              ))}
            </div>
          ) : (
            <p>No Tags found.</p>
          )}
        </div>
        <Button
          onClick={() => setShowTagList(false)} // Hide the tag list popout
          className="w-full mt-4 bg-gray-500 text-white"
        >
          Close 
        </Button>
      </div>
    </div>
  );
  
  // Rest of the code remains the same...
  
  if (!isOpen) return null;
  
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Manage Tags</DialogTitle>
        <DialogDescription>
          Create, update, or delete tags here.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {showCreateTag && (
          <div>
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new tag name"
              className="mt-2"
            />
            <Button
              onClick={createTag}
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
                setShowCreateTag(true);
                setButtonsVisible(false);
                setMessage('');
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Create Tag
            </Button>
  
            <Button
              onClick={handleGetTags}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Get Tags
            </Button>
  
            <Button
              onClick={() => {
                setShowUpdateTag(true);
                setButtonsVisible(false);
                setMessage('');
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Update Tag
            </Button>
  
            <Button
              onClick={() => {
                setShowDeleteTag(true);
                setButtonsVisible(false);
                setMessage('');
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Delete Tag
            </Button>
          </>
        )}
  
       
          {showUpdateTag && (
            <div>
              <Input
                type="text"
                value={oldTag}
                onChange={(e) => setOldTag(e.target.value)}
                placeholder="Old tag name"
                className="mt-2"
              />
              <Input
                type="text"
                value={updatedTag}
                onChange={(e) => setUpdatedTag(e.target.value)}
                placeholder="New tag name"
                className="mt-2"
              />
        <Button onClick={updateTag}
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
  
        {showDeleteTag && (
          <div>
            <Input
              type="text"
              value={oldTag}
              onChange={(e) => setOldTag(e.target.value)}
              placeholder="Tag to delete"
              className="mt-2"
            />
            <Button onClick={deleteTag}
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

      {/* Show Tags List Popout */}
      {showTagList && <TagListPopout />}
    </DialogContent>
  );
  
  
  
  
}

