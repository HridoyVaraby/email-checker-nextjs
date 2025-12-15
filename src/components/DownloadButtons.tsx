'use client';

/**
 * DownloadButtons Component
 * 
 * Export options for downloading verification results:
 * - Full list with all flags
 * - Valid-only list
 * - Risky-only list
 * - Format selection (CSV/Excel)
 */

import React, { useState } from 'react';

interface DownloadButtonsProps {
    data: Record<string, unknown>[];
    disabled?: boolean;
}

type FilterType = 'all' | 'valid' | 'invalid' | 'risky';
type FormatType = 'csv' | 'xlsx';

interface DownloadOption {
    filter: FilterType;
    label: string;
    icon: React.ReactNode;
    description: string;
}

export default function DownloadButtons({ data, disabled = false }: DownloadButtonsProps) {
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [format, setFormat] = useState<FormatType>('csv');

    const downloadOptions: DownloadOption[] = [
        {
            filter: 'all',
            label: 'Full List',
            description: 'All emails with verification flags',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            filter: 'valid',
            label: 'Valid Only',
            description: 'Only verified valid emails',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            filter: 'risky',
            label: 'Risky Only',
            description: 'Disposable & role-based emails',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        }
    ];

    const handleDownload = async (filter: FilterType) => {
        if (disabled || data.length === 0) return;

        setIsDownloading(filter);

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data,
                    filter,
                    format
                }),
            });

            if (!response.ok) {
                throw new Error('Download failed');
            }

            // Get filename from headers or generate one
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `email-verification-${filter}.${format}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) {
                    filename = match[1];
                }
            }

            // Create download
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file. Please try again.');
        } finally {
            setIsDownloading(null);
        }
    };

    // Count emails by status
    const getCounts = () => {
        const counts = { all: data.length, valid: 0, invalid: 0, risky: 0 };
        data.forEach(row => {
            const status = row.verification_status as string;
            if (status === 'Valid') counts.valid++;
            else if (status === 'Invalid') counts.invalid++;
            else if (status === 'Risky') counts.risky++;
        });
        return counts;
    };

    const counts = getCounts();

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Download Results</h3>

            {/* Format Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Format
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFormat('csv')}
                        disabled={disabled}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${format === 'csv'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        CSV
                    </button>
                    <button
                        onClick={() => setFormat('xlsx')}
                        disabled={disabled}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${format === 'xlsx'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Excel
                    </button>
                </div>
            </div>

            {/* Download Buttons */}
            <div className="grid gap-3">
                {downloadOptions.map((option) => {
                    const count = counts[option.filter];
                    const isLoading = isDownloading === option.filter;
                    const isDisabled = disabled || count === 0 || isDownloading !== null;

                    return (
                        <button
                            key={option.filter}
                            onClick={() => handleDownload(option.filter)}
                            disabled={isDisabled}
                            className={`
                w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all
                ${isDisabled
                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-black hover:bg-gray-50'
                                }
              `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={isDisabled ? 'text-gray-400' : 'text-black'}>
                                    {isLoading ? (
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        option.icon
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-black'}`}>
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {option.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${count > 0 ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}
                `}>
                                    {count} {count === 1 ? 'email' : 'emails'}
                                </span>
                                <svg className={`w-5 h-5 ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Helper text */}
            {data.length === 0 && (
                <p className="text-sm text-gray-500 text-center mt-4">
                    Run verification first to enable downloads
                </p>
            )}
        </div>
    );
}
