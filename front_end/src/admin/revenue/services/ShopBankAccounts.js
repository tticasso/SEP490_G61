import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import ApiService from '../../../services/ApiService';

const ShopBankAccounts = ({ shopId, onSelectAccount }) => {
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchBankAccounts();
  }, [shopId]);

  const fetchBankAccounts = async () => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      const response = await ApiService.get(`/bank-account/shop/${shopId}`);
      setBankAccounts(Array.isArray(response) ? response : []);
      
      // Tự động chọn tài khoản mặc định nếu có
      if (response && Array.isArray(response) && response.length > 0) {
        const defaultAccount = response.find(acc => acc.is_default) || response[0];
        if (onSelectAccount) {
          onSelectAccount(defaultAccount);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Không thể tải thông tin tài khoản ngân hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  if (loading) {
    return <div className="py-4 text-gray-500 text-center">Đang tải thông tin tài khoản...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center">
        <AlertTriangle size={18} className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (!bankAccounts || bankAccounts.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md flex items-center">
        <AlertTriangle size={18} className="mr-2" />
        <span>Cửa hàng chưa cập nhật thông tin tài khoản ngân hàng</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bankAccounts.map((account) => (
        <div 
          key={account._id} 
          className={`border ${account.is_default ? 'border-blue-400 bg-blue-50' : 'border-gray-200'} p-4 rounded-md`}
          onClick={() => onSelectAccount && onSelectAccount(account)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">{account.bank_name}</h3>
              <p className="text-sm text-gray-600 mt-1">Chi nhánh: {account.branch || 'Không có thông tin'}</p>
            </div>
            {account.is_default && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Mặc định
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex justify-between items-center border border-gray-200 rounded p-2">
              <div>
                <p className="text-xs text-gray-500">Số tài khoản</p>
                <p className="font-medium">{account.account_number}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(account.account_number, `number-${account._id}`)}
                className="text-blue-600 hover:text-blue-800"
                title="Sao chép số tài khoản"
              >
                {copied === `number-${account._id}` ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            
            <div className="flex justify-between items-center border border-gray-200 rounded p-2">
              <div>
                <p className="text-xs text-gray-500">Chủ tài khoản</p>
                <p className="font-medium">{account.account_holder}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(account.account_holder, `holder-${account._id}`)}
                className="text-blue-600 hover:text-blue-800"
                title="Sao chép tên chủ tài khoản"
              >
                {copied === `holder-${account._id}` ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopBankAccounts;