import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ImageCropper({ onImageCropped, currentImage }) {
  const [selectedImage, setSelectedImage] = useState(currentImage);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: 1,
  });
  const imageRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    onImageCropped(selectedImage);
  }, [selectedImage]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024) {
        console.log("File too large");
        toast.error("Please select an image smaller than 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => setSelectedImage(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Return the base64 encoding of the cropped image
    return canvas.toDataURL("image/jpeg", 1);
  };

  const handleCropComplete = async () => {
    const croppedImageBlob = await getCroppedImg();
    if (croppedImageBlob) {
      onImageCropped(croppedImageBlob);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSelectedImage(reader.result));
      reader.readAsDataURL(files[0]);
    }
  };

  const handleParentClick = (e) => {
    if (
      !selectedImage &&
      fileInputRef.current &&
      e.target === e.currentTarget
    ) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <ToastContainer style={{ zIndex: 9999 }} />
      <div
        className={`flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
          isDragging
            ? "bg-gray-100 bg-opacity-70 border-primary"
            : "border-gray-300 hover:border-primary hover:bg-gray-50 hover:bg-opacity-30"
        }`}
        style={{ zIndex: 100 }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleParentClick}
      >
        {!selectedImage ? (
          <div className="text-center">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
            >
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={onSelectFile}
                  ref={fileInputRef}
                />
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PNG, JPG, GIF up to 500KB
              </p>
            </label>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={handleCropComplete}
              aspect={1}
              circularCrop
            >
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Crop preview"
                className="max-w-full h-auto"
              />
            </ReactCrop>
            <Button
              className="mt-4 w-full"
              onClick={() => setSelectedImage(null)}
              variant="outline"
            >
              Choose Different Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
