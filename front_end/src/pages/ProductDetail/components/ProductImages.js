import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const ProductImages = ({ images, selectedImage, setSelectedImage, product }) => {
    return (
        <div className="md:w-1/2 relative bg-[#F1F5F9] rounded-lg">
            {/* Main image */}
            <div className="relative bg-gray-100">
                <img
                    src={images[selectedImage]}
                    alt={product.name || 'Product image'}
                    className="w-full h-[550px] object-contain rounded-lg"
                />
                {/* <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Heart size={18} className="text-gray-600" />
                </button>
                <button className="absolute top-14 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Share2 size={18} className="text-gray-600" />
                </button> */}
            </div>

            {/* Thumbnail images */}
            {/* <Swiper
                slidesPerView={3.7}
                spaceBetween={10}
                className="mySwiper mt-2 px-2"
            >
                {images.map((image, index) => (
                    <SwiperSlide
                        key={index}
                        className={`w-16 h-16 border-2 rounded-md cursor-pointer overflow-hidden ${
                            selectedImage === index ? "border-blue-500" : "border-gray-200"
                        }`}
                        onClick={() => setSelectedImage(index)}
                    >
                        <img
                            src={image}
                            alt={`${product.name || 'Product'} - view ${index + 1}`}
                            className="w-[151px] h-[125px] object-cover rounded-lg"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>  */}
        </div>
    );
};

export default ProductImages;