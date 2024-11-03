import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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

  useEffect(() => {
    onImageCropped(selectedImage);
    console.log(selectedImage);
  }, [selectedImage]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSelectedImage(reader.result));
      //reader.readAsDataURL(e.target.files[0]);
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

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg">
      {!selectedImage ? (
        <div className="text-center">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
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
              />
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, GIF up to 10MB
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
  );
}
