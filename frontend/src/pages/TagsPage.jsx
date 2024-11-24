import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
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

export function TagsPage() {
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
  const [isToastOpen, setIsToastOpen] = useState(false); // State for toast
  const [toastMessage, setToastMessage] = useState(''); // State for toast message
  const [toastType, setToastType] = useState(''); // State for toast type

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
      setToastMessage('Error fetching Tags');
      setToastType('error');
      setIsToastOpen(true);
    }
  };

  useEffect(() => {
    fetchTags();
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
        setToastMessage('Tag created successfully!');
        setToastType('success');
        setIsToastOpen(true); // Open toast
        fetchTags();
        setShowCreateTag(false);
        hideMessageAfterDelay(setSuccessMessage);
      } catch (error) {
        setMessage('This tag already exists.');
        setToastMessage('This tag already exists.');
        setToastType('error');
        setIsToastOpen(true);
        hideMessageAfterDelay(setMessage);
      }
    } else {
      setMessage('Please enter a tag name.');
      setToastMessage('Please enter a tag name.');
      setToastType('error');
      setIsToastOpen(true);
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
        setToastMessage('Tag updated successfully!');
        setToastType('success');
        setIsToastOpen(true);
        setEditTagId(null);
        setEditTagName('');
        fetchTags();
        hideMessageAfterDelay(setSuccessMessage);
      } catch (error) {
        setEditErrorMessage('Tag name already exists');
        setToastMessage('Tag name already exists');
        setToastType('error');
        setIsToastOpen(true);
        hideMessageAfterDelay(setEditErrorMessage);
      }
    } else {
      setEditErrorMessage('Please provide a valid tag name.');
      setToastMessage('Please provide a valid tag name.');
      setToastType('error');
      setIsToastOpen(true);
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
      setToastMessage('Tag deleted successfully!');
      setToastType('success');
      setIsToastOpen(true);
      fetchTags();
      hideMessageAfterDelay(setSuccessMessage);
    } catch (error) {
      console.error('Error deleting tag:', error.response?.data || error.message);
      setMessage('Error deleting tag');
      setToastMessage('Error deleting tag');
      setToastType('error');
      setIsToastOpen(true);
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
    <div className="min-h-screen p-6">
      <ToastProvider>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            {!showCreateTag ? (
              <Button 
                onClick={() => setShowCreateTag(true)} 
                className="w-full bg-[#5D9297] hover:bg-[#388A94] text-white"
              >
                Create New Tag
              </Button>
            ) : (
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
                    className="flex-1 bg-[#F88C33] hover:bg-orange-500 active:bg-[#2D6F77] 
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Changed gap-4 to gap-2 and added mb-2 */}
            {tags.map((tag) => (
              <div 
                key={tag._id} 
                className="bg-white border border-gray-300 p-4 rounded-lg hover:shadow-md flex items-center justify-between"
              >
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[#003f66] font-medium">{tag.type}</span>
                  <span className="text-gray-500 text-sm self-start text-right mr-8">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setEditTagId(tag._id);
                      setEditTagName(tag.type);
                    }}
                    className="p-2 bg-[#B5D3D1] text-[#2D6F77] border border-[#2D6F77] 
                    hover:bg-[#2D6F77] hover:text-white active:bg-[#1A3B47] 
                    active:transform active:scale-95 transition-all duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(tag)}
                    className="p-2 bg-red-100 text-red-500 hover:bg-red-200 hover:text-white transition duration-300 ease-in-out"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* {message && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
              {message}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
              {successMessage}
            </div>
          )} */}
        </div>

        <DeleteConfirmation
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          itemType="tag"
          onConfirm={handleConfirmDelete}
        />

        {/* Edit Tag Dialog */}
        {editTagId && (
          <Dialog open={!!editTagId} onOpenChange={() => setEditTagId(null)}>
            <DialogContent className="sm:max-w-[500px] p-6 bg-white shadow-lg rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-[#003f66]">Edit Tag</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                className="border-[#808080] mb-2"
              />
              {editErrorMessage && (
                <p className="text-red-500 text-sm mb-2">{editErrorMessage}</p>
              )}
              <DialogFooter className="sm:justify-start">
                <Button
                  onClick={updateTag}
                  className="bg-[#F88C33] hover:bg-orange-500 text-white"
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
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <ToastViewport />
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

export default TagsPage;