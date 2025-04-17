import React, { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';
import Sidebar from './Sidebar';
import { Loader, AlertCircle } from 'lucide-react';

// Bank Account Form Component
const BankAccountForm = ({ bankAccount, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    branch: '',
    is_default: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  
  // Danh sách các ngân hàng ở Việt Nam và định dạng số tài khoản
  const vietnameseBanks = [
    { id: 'VCB', name: 'Vietcombank (VCB)', format: /^\d{10,13}$/, description: '10-13 số' },
    { id: 'BIDV', name: 'BIDV', format: /^\d{14}$/, description: '14 số' }, 
    { id: 'VIETINBANK', name: 'VietinBank', format: /^\d{11,12}$/, description: '11-12 số' },
    { id: 'AGRIBANK', name: 'Agribank', format: /^\d{13}$/, description: '13 số' },
    { id: 'TECHCOMBANK', name: 'Techcombank', format: /^\d{14}$/, description: '14 số' },
    { id: 'ACB', name: 'ACB', format: /^\d{8,16}$/, description: '8-16 số' },
    { id: 'MBBANK', name: 'MB Bank', format: /^\d{11,16}$/, description: '11-16 số' },
    { id: 'VPBANK', name: 'VPBank', format: /^\d{10,16}$/, description: '10-16 số' },
    { id: 'SACOMBANK', name: 'Sacombank', format: /^\d{9,12}$/, description: '9-12 số' },
    { id: 'TPBANK', name: 'TPBank', format: /^\d{12}$/, description: '12 số' },
    { id: 'HDBANK', name: 'HDBank', format: /^\d{10,15}$/, description: '10-15 số' },
    { id: 'OCEANBANK', name: 'OceanBank', format: /^\d{10,15}$/, description: '10-15 số' },
    { id: 'ABBANK', name: 'ABBank', format: /^\d{10,16}$/, description: '10-16 số' },
    { id: 'OCB', name: 'OCB', format: /^\d{10,15}$/, description: '10-15 số' },
    { id: 'SEABANK', name: 'SeABank', format: /^\d{10,15}$/, description: '10-15 số' },
    { id: 'DONGABANK', name: 'DongA Bank', format: /^\d{10,15}$/, description: '10-15 số' },
    { id: 'EXIMBANK', name: 'Eximbank', format: /^\d{13}$/, description: '13 số' },
    { id: 'SHBVN', name: 'SHB', format: /^\d{10,15}$/, description: '10-15 số' },
    { id: 'OTHER', name: 'Ngân hàng khác', format: /^\d{6,20}$/, description: '6-20 số' }
  ];

  useEffect(() => {
    if (bankAccount) {
      setFormData({
        bank_name: bankAccount.bank_name || '',
        account_number: bankAccount.account_number || '',
        account_holder: bankAccount.account_holder || '',
        branch: bankAccount.branch || '',
        is_default: bankAccount.is_default || false
      });
      
      // Tìm ngân hàng trong danh sách nếu có
      const foundBank = vietnameseBanks.find(bank => bank.name === bankAccount.bank_name);
      if (foundBank) {
        setSelectedBank(foundBank.id);
      } else {
        setSelectedBank('OTHER');
      }
    }
  }, [bankAccount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'bank_name_select') {
      // Khi chọn ngân hàng từ dropdown
      setSelectedBank(value);
      if (value === 'OTHER') {
        setFormData(prev => ({
          ...prev,
          bank_name: ''
        }));
      } else {
        const selectedBankInfo = vietnameseBanks.find(bank => bank.id === value);
        setFormData(prev => ({
          ...prev,
          bank_name: selectedBankInfo ? selectedBankInfo.name : ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Xóa lỗi khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateAccountNumber = (accountNumber, bankId) => {
    if (!accountNumber.trim()) {
      return 'Số tài khoản không được để trống';
    }
    
    // Chỉ cho phép nhập số
    if (!/^\d+$/.test(accountNumber)) {
      return 'Số tài khoản chỉ được chứa các chữ số';
    }
    
    // Kiểm tra độ dài hợp lý (6-20 số)
    if (accountNumber.length < 6 || accountNumber.length > 20) {
      return 'Số tài khoản phải có độ dài từ 6-20 số';
    }
    
    return null;
  };

  const validate = () => {
    const newErrors = {};
    
    // Kiểm tra tên ngân hàng
    if (selectedBank === 'OTHER' && !formData.bank_name.trim()) {
      newErrors.bank_name = 'Tên ngân hàng không được để trống';
    }
    
    // Kiểm tra số tài khoản
    const accountNumberError = validateAccountNumber(formData.account_number, selectedBank);
    if (accountNumberError) {
      newErrors.account_number = accountNumberError;
    }
    
    // Kiểm tra tên chủ tài khoản
    if (!formData.account_holder.trim()) {
      newErrors.account_holder = 'Tên chủ tài khoản không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        shop_id: bankAccount?.shop_id
      });
      
      setFormData({
        bank_name: '',
        account_number: '',
        account_holder: '',
        branch: '',
        is_default: false
      });
      setSelectedBank('');
      
    } catch (error) {
      console.error('Error saving bank account:', error);
      alert('Có lỗi xảy ra khi lưu tài khoản ngân hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {bankAccount?._id ? 'Cập nhật tài khoản ngân hàng' : 'Thêm tài khoản ngân hàng mới'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="bank_name_select">
          Chọn ngân hàng <span className="text-red-500">*</span>
        </label>
        <select
          id="bank_name_select"
          name="bank_name_select"
          value={selectedBank}
          onChange={handleChange}
          className={`w-full p-2 border rounded border-gray-300`}
        >
          <option value="">-- Chọn ngân hàng --</option>
          {vietnameseBanks.map(bank => (
            <option key={bank.id} value={bank.id}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>
      
      {selectedBank === 'OTHER' && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="bank_name">
            Tên ngân hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="bank_name"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.bank_name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Nhập tên ngân hàng"
          />
          {errors.bank_name && <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="account_number">
          Số tài khoản <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="account_number"
          name="account_number"
          value={formData.account_number}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.account_number ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập số tài khoản"
        />
        {errors.account_number && <p className="text-red-500 text-sm mt-1">{errors.account_number}</p>}
        {selectedBank && !errors.account_number && (
          <p className="text-gray-500 text-sm mt-1">
            {vietnameseBanks.find(bank => bank.id === selectedBank)?.description}
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="account_holder">
          Tên chủ tài khoản <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="account_holder"
          name="account_holder"
          value={formData.account_holder}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.account_holder ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập tên chủ tài khoản"
        />
        {errors.account_holder && <p className="text-red-500 text-sm mt-1">{errors.account_holder}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="branch">
          Chi nhánh
        </label>
        <input
          type="text"
          id="branch"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Nhập chi nhánh ngân hàng (không bắt buộc)"
        />
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-gray-700">Đặt làm tài khoản mặc định</span>
        </label>
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : bankAccount?._id ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
};

// Bank Account List Component
const BankAccountList = ({ bankAccounts, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      {bankAccounts.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Bạn chưa có tài khoản ngân hàng nào. Vui lòng thêm tài khoản.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên ngân hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tài khoản
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chủ tài khoản
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chi nhánh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bankAccounts.map((account) => (
              <tr key={account._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.bank_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{account.account_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{account.account_holder}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{account.branch || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {account.is_default ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Mặc định
                    </span>
                  ) : (
                    <button
                      onClick={() => onSetDefault(account._id)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Đặt mặc định
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(account)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(account._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Main Bank Account Management Component
const BankAccountManagement = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shop, setShop] = useState(null);
  const fetchInProgress = React.useRef(false);

  const currentUser = AuthService.getCurrentUser();
  
  useEffect(() => {
    // Check if logged in and has appropriate role
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    
    if (!AuthService.hasRole('ROLE_SHOP') && !AuthService.hasRole('ROLE_SELLER')) {
      window.location.href = '/dashboard';
      return;
    }
    
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Lấy thông tin shop trước - tương tự như trong ProductList
      const shopData = await ApiService.get('/shops/my-shop');
      
      if (!shopData) {
        setError('Không tìm thấy thông tin cửa hàng. Vui lòng cập nhật thông tin cửa hàng trước.');
        setIsLoading(false);
        fetchInProgress.current = false;
        return;
      }
      
      setShop(shopData);
      const shopId = shopData._id;
      
      // Sau khi có shopId, lấy danh sách tài khoản ngân hàng
      const accounts = await ApiService.get(`/bank-account/shop/${shopId}`);
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setError('Không thể tải danh sách tài khoản ngân hàng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  };

  const handleAddNew = () => {
    setSelectedAccount(null);
    setIsFormVisible(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sử dụng ApiService trực tiếp
      await ApiService.delete(`/bank-account/delete/${id}`);
      setBankAccounts(bankAccounts.filter(account => account._id !== id));
      alert('Xóa tài khoản ngân hàng thành công');
    } catch (error) {
      console.error('Error deleting bank account:', error);
      alert('Có lỗi xảy ra khi xóa tài khoản ngân hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    setIsSubmitting(true);
    
    try {
      const accountToUpdate = bankAccounts.find(account => account._id === id);
      if (!accountToUpdate) return;
      
      // Sử dụng ApiService trực tiếp
      await ApiService.put(`/bank-account/edit/${id}`, {
        ...accountToUpdate,
        is_default: true
      });
      
      // Update local state to reflect the change
      setBankAccounts(bankAccounts.map(account => ({
        ...account,
        is_default: account._id === id
      })));
      
    } catch (error) {
      console.error('Error setting default bank account:', error);
      alert('Có lỗi xảy ra khi đặt tài khoản mặc định');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (formData) => {
    if (!shop || !shop._id) {
      alert('Không tìm thấy thông tin cửa hàng. Vui lòng cập nhật thông tin cửa hàng trước.');
      return;
    }
    
    // Add shop_id to data if not present
    const completeData = {
      ...formData,
      shop_id: formData.shop_id || shop._id
    };
    
    try {
      if (selectedAccount?._id) {
        // Update existing account - sử dụng ApiService trực tiếp
        const updatedAccount = await ApiService.put(
          `/bank-account/edit/${selectedAccount._id}`,
          completeData
        );
        
        // Update in the local state
        setBankAccounts(bankAccounts.map(account => 
          account._id === selectedAccount._id ? updatedAccount : 
          // If the updated account is default, set others to non-default
          (updatedAccount.is_default ? { ...account, is_default: false } : account)
        ));
        
        alert('Cập nhật tài khoản ngân hàng thành công');
      } else {
        // Create new account - sử dụng ApiService trực tiếp
        const newAccount = await ApiService.post('/bank-account/create', completeData);
        
        // Update the local state
        if (newAccount.is_default) {
          // If the new account is default, update all others to non-default
          setBankAccounts([
            newAccount,
            ...bankAccounts.map(account => ({ ...account, is_default: false }))
          ]);
        } else {
          setBankAccounts([newAccount, ...bankAccounts]);
        }
        
        alert('Thêm tài khoản ngân hàng thành công');
      }
      
      // Close the form
      setIsFormVisible(false);
      setSelectedAccount(null);
      
    } catch (error) {
      console.error('Error saving bank account:', error);
      throw error; // Let the form component handle the error
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setSelectedAccount(null);
  };

  // Cập nhật layout giống với ProductList để thêm sidebar
  return (
    <div className="flex bg-gray-100">
      {/* Sidebar với chiều cao cố định */}
      <div className="w-64 flex-shrink-0 h-screen">
        <Sidebar onNavigate={(path) => { window.location.href = path; }} />
      </div>

      {/* Main content - không có overflow */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Quản lý tài khoản ngân hàng</h1>
            
            {!isFormVisible && (
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isSubmitting}
              >
                Thêm tài khoản mới
              </button>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="p-8 flex justify-center items-center">
              <Loader className="animate-spin mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="p-4 my-4 mx-6 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
              <AlertCircle className="flex-shrink-0 mr-2" size={20} />
              <div>
                <p className="font-medium">Đã xảy ra lỗi</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <div className="p-6">
              {isFormVisible ? (
                <BankAccountForm 
                  bankAccount={selectedAccount} 
                  onSave={handleSave} 
                  onCancel={handleCancel} 
                />
              ) : (
                <BankAccountList 
                  bankAccounts={bankAccounts} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                  onSetDefault={handleSetDefault}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountManagement;