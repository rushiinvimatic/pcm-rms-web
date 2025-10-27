import React from 'react';
import { Button } from '../ui/button';

interface QuickActionsProps {
  onRefresh: () => void;
  onExport?: () => void;
  onFilters?: () => void;
  loading?: boolean;
  itemCount: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onRefresh,
  onExport,
  onFilters,
  loading = false,
  itemCount,
}) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {itemCount} applications
      </div>
      
      <div className="flex items-center space-x-2">
        {onFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilters}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters
          </Button>
        )}
        
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Refresh
        </Button>
      </div>
    </div>
  );
};