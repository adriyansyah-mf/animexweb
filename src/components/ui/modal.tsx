import { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal = ({ isOpen, onClose, videoUrl }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex justify-center items-center">
      <div className="relative w-full h-full max-w-4xl">
        <div className="absolute top-2 right-2 text-white cursor-pointer" onClick={onClose}>
          &times;
        </div>
        <video className="w-full h-full" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoModal;
