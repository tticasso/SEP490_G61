import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronDown,
  Search,
  Plus
} from 'lucide-react';
import Sidebar from './Sidebar';

const AddDiscount = () => {
  const navigate = useNavigate();
  
  // Form state
  const [promotionName, setPromotionName] = useState('san pham demo');
  const [discountType, setDiscountType] = useState('Giảm giá cố định');
  const [isDiscountTypeDropdownOpen, setIsDiscountTypeDropdownOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  
  // Thời gian state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState({ hour: '05', period: 'PM' });

  const discountTypes = [
    'Giảm giá cố định',
    'Phần trăm'
  ];

  // Fake data for date picker
  const currentMonth = 'July 2024';
  const daysInMonth = [
    { day: 30, month: 'prev' }, 
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 },
    { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12, active: true }, { day: 13 },
    { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20 },
    { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 }, { day: 26, selected: true }, { day: 27 },
    { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1, month: 'next' }, { day: 2, month: 'next' }, { day: 3, month: 'next' },
    { day: 4, month: 'next' }, { day: 5, month: 'next' }, { day: 6, month: 'next' }, { day: 7, month: 'next' }, { day: 8, month: 'next' }, { day: 9, month: 'next' }, { day: 10, month: 'next' },
  ];

  const hours = ['05', '06', '07', '08', '09', '10', '11'];
  
  const handleSave = () => {
    // Logic để lưu khuyến mãi
    alert('Đã lưu thành công khuyến mãi: ' + promotionName);
    navigate('/seller-dashboard/discount-product');
  };

  const handleCancel = () => {
    navigate('/seller-dashboard/discount-product');
  };
  
  const handleDateSelect = (day, isEnd = false) => {
    const date = `07/${day}/2024`;
    const time = `${selectedTime.hour}:00 ${selectedTime.period}`;
    const formattedDate = `${date}, ${time}`;
    
    if (isEnd) {
      setEndDate(formattedDate);
      setIsEndDatePickerOpen(false);
    } else {
      setStartDate(formattedDate);
      setIsStartDatePickerOpen(false);
    }
    
    setSelectedDate(day);
  };
  
  const handleTimeSelect = (hour, period, isEnd = false) => {
    setSelectedTime({ hour, period });
    
    if (selectedDate) {
      const date = `07/${selectedDate}/2024`;
      const time = `${hour}:00 ${period}`;
      const formattedDate = `${date}, ${time}`;
      
      if (isEnd) {
        setEndDate(formattedDate);
      } else {
        setStartDate(formattedDate);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-100 min-h-screen">
          {/* Header with back button and action buttons */}
          <div className="flex justify-between items-center mb-6">
            <button 
              className="flex items-center text-gray-600" 
              onClick={handleCancel}
            >
              <ArrowLeft className="mr-2" />
              Quay lại
            </button>
            <div className="flex space-x-4">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSave}
              >
                Lưu
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-6">Cơ bản</h2>

            {/* Promotion Name */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Tên khuyến mãi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-md bg-blue-50"
                value={promotionName}
                onChange={(e) => setPromotionName(e.target.value)}
              />
            </div>

            {/* Discount Type and Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Loại giảm giá
                </label>
                <div className="relative">
                  <div 
                    className="w-full p-3 border rounded-md flex justify-between items-center cursor-pointer"
                    onClick={() => setIsDiscountTypeDropdownOpen(!isDiscountTypeDropdownOpen)}
                  >
                    <span>{discountType}</span>
                    <ChevronDown size={20} className="text-gray-500" />
                  </div>
                  
                  {isDiscountTypeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      {discountTypes.map((type, index) => (
                        <div 
                          key={index}
                          className={`p-3 cursor-pointer hover:bg-gray-100 ${
                            type === discountType ? 'bg-blue-600 text-white' : ''
                          }`}
                          onClick={() => {
                            setDiscountType(type);
                            setIsDiscountTypeDropdownOpen(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Giảm
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 p-3 border rounded-l-md"
                    placeholder={discountType === 'Phần trăm' ? '24' : '99.99'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                  <div className="bg-gray-100 p-3 border-t border-r border-b rounded-r-md min-w-16 text-center">
                    {discountType === 'Phần trăm' ? (
                      <div className="flex items-center">
                        <span className="mr-3">= $0.00</span>
                        <span>%</span>
                      </div>
                    ) : (
                      <span>VND</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Thời gian bắt đầu
                </label>
                <div className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 p-3 border rounded-l-md"
                      placeholder="mm/dd/yyyy, --:-- --"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      readOnly
                    />
                    <button 
                      className="bg-white p-3 border-t border-r border-b rounded-r-md"
                      onClick={() => {
                        setIsStartDatePickerOpen(!isStartDatePickerOpen);
                        setIsEndDatePickerOpen(false);
                      }}
                    >
                      <Calendar size={20} className="text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Date Picker for Start Date */}
                  {isStartDatePickerOpen && (
                    <div className="absolute left-0 z-20 mt-1 bg-white border rounded-md shadow-lg flex">
                      {/* Calendar */}
                      <div className="p-4 border-r">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <span>{currentMonth}</span>
                            <ChevronDown size={16} className="ml-1" />
                          </div>
                          <div className="flex">
                            <button className="p-1 mx-1">
                              <ChevronDown size={16} className="rotate-90" />
                            </button>
                            <button className="p-1 mx-1">
                              <ChevronDown size={16} className="rotate-270" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Days of Week */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <div key={index} className="text-center text-sm">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                          {daysInMonth.map((day, index) => (
                            <div 
                              key={index} 
                              className={`
                                w-8 h-8 flex items-center justify-center rounded-full cursor-pointer
                                ${day.month === 'prev' || day.month === 'next' ? 'text-gray-400' : ''}
                                ${day.active ? 'bg-blue-600 text-white' : ''}
                                ${day.selected ? 'bg-blue-200' : ''}
                                ${!day.active && !day.selected ? 'hover:bg-gray-100' : ''}
                              `}
                              onClick={() => handleDateSelect(day.day)}
                            >
                              {day.day}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time Selector */}
                      <div className="p-4 flex">
                        {/* Hours */}
                        <div className="w-16 border-r pr-3">
                          <div className="flex flex-col items-center">
                            {hours.map((hour, index) => (
                              <div 
                                key={index} 
                                className={`
                                  w-full py-2 text-center cursor-pointer
                                  ${selectedTime.hour === hour ? 'bg-blue-600 text-white rounded' : 'hover:bg-gray-100'}
                                `}
                                onClick={() => handleTimeSelect(hour, selectedTime.period)}
                              >
                                {hour}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* AM/PM */}
                        <div className="w-16 px-3">
                          <div className="flex flex-col items-center">
                            <div 
                              className={`w-full py-2 text-center cursor-pointer ${selectedTime.period === 'PM' ? 'bg-blue-600 text-white rounded' : 'hover:bg-gray-100'}`}
                              onClick={() => handleTimeSelect(selectedTime.hour, 'PM')}
                            >
                              PM
                            </div>
                            <div 
                              className={`w-full py-2 text-center cursor-pointer ${selectedTime.period === 'AM' ? 'bg-blue-600 text-white rounded' : 'hover:bg-gray-100'}`}
                              onClick={() => handleTimeSelect(selectedTime.hour, 'AM')}
                            >
                              AM
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Thời gian kết thúc
                </label>
                <div className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 p-3 border rounded-l-md"
                      placeholder="mm/dd/yyyy, --:-- --"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      readOnly
                    />
                    <button 
                      className="bg-white p-3 border-t border-r border-b rounded-r-md"
                      onClick={() => {
                        setIsEndDatePickerOpen(!isEndDatePickerOpen);
                        setIsStartDatePickerOpen(false);
                      }}
                    >
                      <Calendar size={20} className="text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Date Picker for End Date */}
                  {isEndDatePickerOpen && (
                    <div className="absolute right-0 z-20 mt-1 bg-white border rounded-md shadow-lg flex">
                      {/* Calendar */}
                      <div className="p-4 border-r">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <span>{currentMonth}</span>
                            <ChevronDown size={16} className="ml-1" />
                          </div>
                          <div className="flex">
                            <button className="p-1 mx-1">
                              <ChevronDown size={16} className="rotate-90" />
                            </button>
                            <button className="p-1 mx-1">
                              <ChevronDown size={16} className="rotate-270" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Days of Week */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <div key={index} className="text-center text-sm">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                          {daysInMonth.map((day, index) => (
                            <div 
                              key={index} 
                              className={`
                                w-8 h-8 flex items-center justify-center rounded-full cursor-pointer
                                ${day.month === 'prev' || day.month === 'next' ? 'text-gray-400' : ''}
                                ${day.active ? 'bg-blue-600 text-white' : ''}
                                ${day.selected ? 'bg-blue-200' : ''}
                                ${!day.active && !day.selected ? 'hover:bg-gray-100' : ''}
                              `}
                              onClick={() => handleDateSelect(day.day, true)}
                            >
                              {day.day}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time Selector */}
                      <div className="p-4 flex">
                        {/* Hours */}
                        <div className="w-16 border-r pr-3">
                          <div className="flex flex-col items-center">
                            {hours.map((hour, index) => (
                              <div 
                                key={index} 
                                className={`
                                  w-full py-2 text-center cursor-pointer
                                  ${selectedTime.hour === hour ? 'bg-blue-600 text-white rounded' : 'hover:bg-gray-100'}
                                `}
                                onClick={() => handleTimeSelect(hour, selectedTime.period, true)}
                              >
                                {hour}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* AM/PM */}
                        <div className="w-16 px-3">
                          <div className="flex flex-col items-center">
                            <div 
                              className={`w-full py-2 text-center cursor-pointer ${selectedTime.period === 'PM' ? 'bg-blue-600 text-white rounded' : 'hover:bg-gray-100'}`}
                              onClick={() => handleTimeSelect(selectedTime.hour, 'PM', true)}
                            >
                              PM
                            </div>
                            <div 
                              className={`w-full py-2 text-center cursor-pointer ${selectedTime.period === 'AM' ? 'bg-blue-600 text-white rounded' : 'hover:bg-gray-100'}`}
                              onClick={() => handleTimeSelect(selectedTime.hour, 'AM', true)}
                            >
                              AM
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Apply to Products Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Áp Dụng Cho</h2>
            <p className="text-gray-600 mb-6">Chọn những sản phẩm áp dụng giảm giá này.</p>

            {/* Search Products */}
            <div className="flex mb-6">
              <div className="relative flex-1 mr-4">
                <input
                  type="text"
                  className="w-full p-3 border rounded-md pl-10"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Browse
              </button>
            </div>

            {/* Selected Products will show here */}
            <div className="border border-dashed rounded-md p-6 text-center text-gray-500">
              No products selected. Click "Browse" to add products.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDiscount;