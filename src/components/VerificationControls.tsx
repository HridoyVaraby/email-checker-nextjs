'use client';

/**
 * VerificationControls Component
 * 
 * Controls for running email verification including:
 * - Email column selector
 * - Verification options (MX check, SMTP check)
 * - Run verification button
 * - Progress indicator
 */

import React, { useState } from 'react';

interface VerificationControlsProps {
    columns: string[];
    selectedColumn: string | null;
    onColumnChange: (column: string) => void;
    onVerify: (options: VerificationOptions) => void;
    isVerifying: boolean;
    progress: number;
    processedCount: number;
    dataCount: number;
}

export interface VerificationOptions {
    checkMx: boolean;
    checkSmtp: boolean;
}

export default function VerificationControls({
    columns,
    selectedColumn,
    onColumnChange,
    onVerify,
    isVerifying,
    progress,
    processedCount,
    dataCount
}: VerificationControlsProps) {
    const [checkMx, setCheckMx] = useState(true);
    const [checkSmtp, setCheckSmtp] = useState(false);

    const handleVerify = () => {
        if (!selectedColumn) return;
        onVerify({ checkMx, checkSmtp });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Verification Settings</h3>

            <div className="space-y-4">
                {/* Email Column Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Column
                    </label>
                    <select
                        value={selectedColumn || ''}
                        onChange={(e) => onColumnChange(e.target.value)}
                        disabled={isVerifying}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">Select email column...</option>
                        {columns.map((col) => (
                            <option key={col} value={col}>
                                {col}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Verification Options */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Verification Options
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={checkMx}
                            onChange={(e) => setCheckMx(e.target.checked)}
                            disabled={isVerifying}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">
                            Check MX Records
                            <span className="text-gray-500 ml-1">(Domain validation)</span>
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={checkSmtp}
                            onChange={(e) => setCheckSmtp(e.target.checked)}
                            disabled={isVerifying}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">
                            SMTP Verification
                            <span className="text-gray-500 ml-1">(Optional, slower)</span>
                        </span>
                    </label>
                </div>

                {/* Data Summary */}
                {dataCount > 0 && !isVerifying && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <p className="text-sm text-gray-600">
                            Ready to verify <span className="font-semibold text-black">{dataCount}</span> email{dataCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Progress Bar */}
                {isVerifying && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Processing...</span>
                            <span>{processedCount} / {dataCount} Emails ({Math.round(progress)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-black h-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={!selectedColumn || isVerifying || dataCount === 0}
                    className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            transition-all duration-200
            ${!selectedColumn || isVerifying || dataCount === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800 active:bg-gray-900'
                        }
          `}
                >
                    {isVerifying ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        'Run Verification'
                    )}
                </button>
            </div>
        </div>
    );
}
