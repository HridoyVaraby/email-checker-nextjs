'use client';

/**
 * ResultsTable Component
 * 
 * Displays verification results in a paginated, filterable table.
 * Features:
 * - Color-coded status pills
 * - Search/filter functionality
 * - Pagination
 * - Responsive design
 */

import React, { useState, useMemo } from 'react';

// Type for verification status
type VerificationStatus = 'Valid' | 'Invalid' | 'Risky' | 'Unknown' | 'TMD';

// Type for table data
export interface TableRow {
    [key: string]: unknown;
    verification_status?: VerificationStatus;
    verification_reason?: string;
}

interface ResultsTableProps {
    data: TableRow[];
    emailColumn: string;
}

// Status pill component
function StatusPill({ status }: { status: VerificationStatus }) {
    const styles: Record<VerificationStatus, string> = {
        Valid: 'bg-white text-black border-2 border-black',
        Invalid: 'bg-black text-white border-2 border-black',
        Risky: 'bg-gray-400 text-white border-2 border-gray-400',
        Unknown: 'bg-white text-gray-500 border-2 border-gray-300',
        TMD: 'bg-purple-100 text-purple-800 border-2 border-purple-300',
    };

    return (
        <span className={`
      ${styles[status] || styles.Unknown}
      px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1
    `}>
            {status}
        </span>
    );
}

export default function ResultsTable({ data, emailColumn }: ResultsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
    const rowsPerPage = 10;

    // Get all columns except internal ones
    const columns = useMemo(() => {
        if (data.length === 0) return [];
        return Object.keys(data[0]).filter(col => col !== 'verification_reason');
    }, [data]);

    // Filter data based on search and status filter
    const filteredData = useMemo(() => {
        return data.filter((row) => {
            // Status filter
            if (statusFilter !== 'all' && row.verification_status !== statusFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return Object.values(row).some(value =>
                    String(value ?? '').toLowerCase().includes(searchLower)
                );
            }

            return true;
        });
    }, [data, searchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No results to display</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'Valid', 'Invalid', 'Risky', 'TMD', 'Unknown'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${statusFilter === status
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
              `}
                        >
                            {status === 'all' ? 'All' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-600 mb-3">
                Showing {paginatedData.length} of {filteredData.length} results
                {filteredData.length !== data.length && ` (filtered from ${data.length} total)`}
            </p>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                #
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className={`
                    px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                    ${col === emailColumn ? 'text-black' : 'text-gray-700'}
                    ${col === 'verification_status' ? 'text-center' : ''}
                  `}
                                >
                                    {col.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    {(currentPage - 1) * rowsPerPage + idx + 1}
                                </td>
                                {columns.map((col) => (
                                    <td
                                        key={col}
                                        className={`
                      px-4 py-3 text-sm whitespace-nowrap
                      ${col === emailColumn ? 'font-medium text-black' : 'text-gray-600'}
                      ${col === 'verification_status' ? 'text-center' : ''}
                    `}
                                    >
                                        {col === 'verification_status' ? (
                                            <StatusPill status={row[col] as VerificationStatus} />
                                        ) : (
                                            String(row[col] ?? '')
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                                    No results match your filters
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
              `}
                        >
                            Previous
                        </button>

                        {/* Page numbers */}
                        <div className="hidden sm:flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`
                      w-10 h-10 rounded-lg text-sm font-medium transition-all
                      ${currentPage === pageNum
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }
                    `}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
              `}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
