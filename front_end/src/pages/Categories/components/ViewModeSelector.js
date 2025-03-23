import React from 'react';
import { Grid, List } from 'lucide-react';

const ViewModeSelector = ({ viewMode, setViewMode, sortOption, setSortOption }) => {
    return (
        <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`
                        p-2 rounded 
                        ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}
                    `}
                >
                    <Grid size={20} />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`
                        p-2 rounded 
                        ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}
                    `}
                >
                    <List size={20} />
                </button>
            </div>
            <div>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="Đặc sắc">Đặc sắc</option>
                    <option value="Giá thấp">Giá thấp</option>
                    <option value="Giá cao">Giá cao</option>
                </select>
            </div>
        </div>
    );
};

export default ViewModeSelector;