import React, { useState } from 'react';
import { Truck, Package, MessageCircle, MapPin, Phone, Mail, Calendar, Award } from 'lucide-react';
import dienthoai from '../../../assets/dienthoai.jpg'

const ShopDetailTabs = ({ shopDetails }) => {
  const [activeTab, setActiveTab] = useState('store');

  // Sample reviews data
  const reviews = [
    {
      id: 1,
      username: 'Hungreo',
      avatar: null,
      rating: 5,
      date: '5 ngày trước',
      product: 'Cần bán Xiaomi 14 12/256GB Likenew 99%',
      price: '9.990.000 đ',
      productImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSepgd_afQeitCQ66Rr4Sg5-R6djjEgrMeSMg&s',
    },
    {
      id: 2,
      username: 'Phúc Hưng',
      avatar: null,
      rating: 5,
      date: '2 tuần trước',
      product: 'Điện Thoại Vivo iQOO Z9 Turbo 256GB - New Fullbox',
      price: '6.790.000 đ',
      productImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5s0SCMcSsfidnhpwznJc1XwKnCsLa188BAQ&s',
    },
    {
      id: 3,
      username: 'Quốc Chánh',
      avatar: null,
      rating: 5,
      date: '3 tuần trước',
      product: 'Mtb Xiaomi Mi Pad 6 hàng likenew fullbox 99%',
      price: '5.390.000 đ',
      productImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfXBZra7hJcNP7XnOfvKxaEQjhduUZWcUtig&s',
      tags: ['Đáng tin cậy', 'Giao tiếp lịch sự, thân thiện', 'Mô tả sản phẩm đúng']
    },
    {
      id: 4,
      username: 'Tùng Đặng',
      avatar: 'T',
      rating: 5,
      date: '1 tháng trước',
      comment: 'Giao hàng khá nhanh, hàng chất lượng shop mải định :))'
    }
  ];

  // Rendering the stars for ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
    );
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'store':
        return (
          <div className="py-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Giới thiệu</h3>
                <div className="bg-white p-5 rounded-lg shadow">
                  <p className="text-sm text-gray-700 mb-4">
                    Giới thiệu về Vinh An Mobile !<br />
                    Ra đời vào năm 2004, Vinh An Mobile đã sớm có một vị trí vững chắc trên thị trường bán lẻ di động xách tay, hàng công nghệ, linh kiện - phụ kiện điện thoại di động, sửa chữa điện thoại trong nước, trở thành địa chỉ...
                  </p>
                  <a href="#" className="text-blue-500 text-sm hover:underline">Xem thêm</a>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="text-sm">12D Đường Tống Văn Trân, Phường 5, Quận 11, Hồ Chí Minh, Việt Nam</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-sm">09085***** <button className="text-blue-500 hover:underline">Hiện số</button></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Chính sách cửa hàng</h3>
                <div className="bg-white p-5 rounded-lg shadow">
                  <ul className="space-y-4">
                    <li className="flex">
                      <div className="mr-3">
                        <Truck className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Miễn phí vận chuyển nội thành</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3">
                        <Package className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Bảo hành 6 tháng phần cứng</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3">
                        <Calendar className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Đổi trả hàng 1 đổi 1 trong 7 ngày</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3">
                        <Award className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Trợ giá thu cũ lên đời mới</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Hoạt động</h3>
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="relative aspect-video">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Activity" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center mb-2">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Vinh An Mobile" className="w-8 h-8 rounded-full mr-2" />
                        <div>
                          <p className="font-medium text-sm">Vinh An Mobile</p>
                          <p className="text-xs text-gray-500">5 tháng trước</p>
                        </div>
                      </div>
                      <p className="text-sm">Dành cho Anh em nào thích Newseal cực đỉnh a 🔥</p>
                      <p className="text-sm font-medium mt-1">IQOO 12 Newseal 12GB/256GB...</p>
                      <a href="#" className="text-blue-500 text-xs hover:underline">Xem thêm</a>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="relative aspect-video">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOkAOihqSfSXvbaLKoTy83L4QOmjEEUokWAQ&s" alt="Activity" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center mb-2">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Vinh An Mobile" className="w-8 h-8 rounded-full mr-2" />
                        <div>
                          <p className="font-medium text-sm">Vinh An Mobile</p>
                          <p className="text-xs text-gray-500">6 tháng trước</p>
                        </div>
                      </div>
                      <p className="text-sm">shop hôm nay về hàng</p>
                      <p className="text-sm font-medium mt-1">Điện thoại Vivo iQOO Z9x - New Fullbox</p>
                      <a href="#" className="text-blue-500 text-xs hover:underline">Xem thêm</a>
                    </div>
                  </div>
                </div>
                
                <div className="text-right mt-4">
                  <a href="#" className="text-sm text-gray-500 hover:underline flex items-center justify-end">
                    Xem tất cả
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="py-6">
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="flex items-start">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Vinh An Mobile" className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium">Vinh An Mobile</p>
                      <span className="mx-2 text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">5 tháng trước</span>
                    </div>
                    <p className="mt-2">Dành cho Anh em nào thích Newseal cực đỉnh a 🔥</p>
                    <p className="font-medium mt-1">IQOO 12 Newseal 12GB/256GB... <span className="text-blue-500 hover:underline cursor-pointer">Xem thêm</span></p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Product" className="w-full h-48 object-cover rounded" />
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFRCBvaaUuSoLQC9AlVJtoyndVDuHHmyZxIw&s" alt="Product" className="w-full h-48 object-cover rounded" />
                    </div>
                    
                    <div className="mt-3 flex items-center">
                      <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>2</span>
                      </button>
                      
                      <button className="flex items-center text-gray-500 hover:text-gray-700 ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>1 Bình luận</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="flex items-start">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Vinh An Mobile" className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium">Vinh An Mobile</p>
                      <span className="mx-2 text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">6 tháng trước</span>
                    </div>
                    <p className="mt-2">shop hôm nay về hàng</p>
                    <p className="font-medium mt-1">Điện thoại Vivo iQOO Z9x - New Fullbox <span className="text-blue-500 hover:underline cursor-pointer">Xem thêm</span></p>
                    
                    <div className="mt-3">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFRCBvaaUuSoLQC9AlVJtoyndVDuHHmyZxIw&s" alt="Product" className="w-full h-64 object-cover rounded" />
                    </div>
                    
                    <div className="mt-3 flex items-center">
                      <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>0</span>
                      </button>
                      
                      <button className="flex items-center text-gray-500 hover:text-gray-700 ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>0 Bình luận</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'reviews':
        return (
          <div className="py-6">
            <div className="bg-white p-5 rounded-lg shadow mb-6">
              <div className="flex items-center mb-4">
                <div className="text-3xl font-bold mr-2">4.8</div>
                {renderStars(4.8)}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Sản phẩm giá tốt (15)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Chất lượng sản phẩm tốt (13)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Đúng hẹn (12)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Giao tiếp lịch sự, thân thiện (19)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Đáng tin cậy (16)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Mô tả sản phẩm đúng (15)
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex border-b border-gray-200">
                  <button className="py-2 px-4 font-medium border-b-2 border-orange-500 text-orange-500">
                    TẤT CẢ (43)
                  </button>
                  <button className="py-2 px-4 font-medium text-gray-500">
                    TỪ NGƯỜI MUA (43)
                  </button>
                  <button className="py-2 px-4 font-medium text-gray-500">
                    TỪ NGƯỜI BÁN (0)
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-start">
                    <div className="mr-3">
                      {review.avatar ? (
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                          {review.avatar}
                        </div>
                      ) : (
                        <img 
                          src={`https://ui-avatars.com/api/?name=${review.username}&background=random`} 
                          alt={review.username} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{review.username}</h4>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                      
                      <div className="mt-1">
                        {renderStars(review.rating)}
                      </div>
                      
                      {review.product && (
                        <div className="mt-3 flex items-start border-t border-gray-100 pt-3">
                          <img 
                            src={review.productImage} 
                            alt={review.product} 
                            className="w-16 h-16 object-cover rounded mr-3"
                          />
                          <div>
                            <p className="text-sm">{review.product}</p>
                            <p className="text-red-500 font-medium">{review.price}</p>
                          </div>
                        </div>
                      )}
                      
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                      )}
                      
                      {review.tags && review.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {review.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 bg-[#E7E9EA]">
      {/* Tab Navigation */}
      <div className="flex border-b bg-white">
        <button 
          className={`py-3 px-6 font-medium ${activeTab === 'store' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('store')}
        >
          CỬA HÀNG
        </button>
        <button 
          className={`py-3 px-6 font-medium ${activeTab === 'activity' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('activity')}
        >
          HOẠT ĐỘNG
        </button>
        <button 
          className={`py-3 px-6 font-medium ${activeTab === 'reviews' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('reviews')}
        >
          ĐÁNH GIÁ
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="container mx-auto px-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ShopDetailTabs;