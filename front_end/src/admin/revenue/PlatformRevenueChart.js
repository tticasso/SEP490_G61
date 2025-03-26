import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PlatformRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">Không có dữ liệu biểu đồ</div>;
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    month: item.month,
    totalRevenue: item.total_revenue,
    platformCommission: item.total_commission,
    shopEarnings: item.total_revenue - item.total_commission,
  }));

  // Custom tooltip formatter
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="totalRevenue" name="Tổng doanh thu" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="platformCommission" name="Hoa hồng nền tảng" stroke="#82ca9d" />
        <Line type="monotone" dataKey="shopEarnings" name="Doanh thu cửa hàng" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PlatformRevenueChart;