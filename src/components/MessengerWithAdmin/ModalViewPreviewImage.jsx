import React, { useState } from 'react';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import { IoClose } from 'react-icons/io5';
function ModalViewPreviewImage({ imageUrl, onClose, images = [], currentIndex = 0 }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const displayImage = images[currentImageIndex] || imageUrl;

    if (!displayImage) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-10 right-10 text-red-500 font-bold bg-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-200"
            >
                <IoClose />
            </button>
            <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <img src={displayImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain" />

                {images.length > 1 && (
                    <>
                        <div>
                            <button
                                onClick={handlePrev}
                                className="absolute left-[-10%] top-1/2 transform -translate-y-1/2 -translate-x-full bg-white bg-opacity-80 text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-100 transition-all shadow-md"
                            >
                                <GrFormPrevious size={20} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-[-10%] top-1/2 transform -translate-y-1/2 translate-x-full bg-white bg-opacity-80 text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-100 transition-all shadow-md"
                            >
                                <GrFormNext size={20} />
                            </button>
                            <div className="absolute left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                {currentImageIndex + 1}/{images.length}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ModalViewPreviewImage;
