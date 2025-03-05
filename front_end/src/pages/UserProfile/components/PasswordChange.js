import React from "react";

const PasswordChange = () => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Đổi Mật Khẩu</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        Xác nhận
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordChange;