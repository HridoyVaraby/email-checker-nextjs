'use client';

import React, { useState } from 'react';

interface ServerDownloadButtonsProps {
    jobId: string;
}

export default function ServerDownloadButtons({ jobId }: ServerDownloadButtonsProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = (format: 'csv' | 'xlsx') => {
        setIsDownloading(true);
        // Direct link to download
        window.location.href = `/api/jobs/${jobId}/download?format=${format}`;

        // Reset state after a delay (since we can't detect when download starts exactly via href)
        setTimeout(() => setIsDownloading(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Export Results</h3>
            <p className="text-sm text-gray-600 mb-6">
                Download the full results including original data and verification status.
            </p>

            <div className="space-y-3">
                <button
                    onClick={() => handleDownload('csv')}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download CSV
                </button>

                <button
                    onClick={() => handleDownload('xlsx')}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Excel
                </button>
            </div>
        </div>
    );
}
