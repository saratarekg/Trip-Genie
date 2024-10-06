"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function TagCRUD({ isOpen, onClose }) {
  const [tags, setTag] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [oldTag, setOldTag] = useState('');
  const [updatedTag, setUpdatedTag] = useState('');
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showUpdateTag, setShowUpdateTag] = useState(false);
  const [showDeleteTag, setShowDeleteTag] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [showTagList, setShowTagList] = useState(false);

  const fetchTags = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await axios.get('http://localhost:4000/admin/tags', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTag(response.data);
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
        await axios.post('http://localhost:4000/admin/tags', { name: newTag }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNewTag('');
        setMessage('Tag created successfully!');
        fetchTags();
        resetButtons();
      } catch (error) {
        setMessage('Error creating tags');
      }
    } else {
      setMessage('Please enter a tag name.');
    }
  };

  const updateTag = async () => {
    setMessage('');
    if (oldTag && newTag) {
      try {
        const token = Cookies.get('jwt');
        const url = `http://localhost:4000/admin/tagbyname?name=${oldTag}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const tag = response.data;

        if (tag && tag._id) {
          await axios.put(`http://localhost:4000/admin/tags/${tag._id}`, 
          { name: updatedTag }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOldTag('');
          setUpdatedTag('');
          setMessage('Tag updated successfully!');
          fetchTags();
          resetButtons();
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
        const url = `http://localhost:4000/admin/tagbyname?name=${oldTag}`;
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
          setMessage('Tag deleted successfully!');
          fetchTags();
          resetButtons();
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
    setShowTagList(true);
  };

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
              value={updateTag}
              onChange={(e) => setUpdatedTag(e.target.value)}
              placeholder="New tag name"
              className="mt-2"
            />
            <Button
              onClick={updateTag}
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
            <Button
              onClick={deleteTag}
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

        {showTagList && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Tags List</h3>
            {tags.length > 0 ? (
              <ul className="list-disc pl-5">
                {tags.map((tag) => (
                  <li key={tag._id} className="text-gray-700">
                    {tag.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Tags found.</p>
            )}
            <Button
              onClick={() => setShowTagList(false)}
              className="w-full mt-4 bg-gray-500 text-white"
            >
              Close List
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}