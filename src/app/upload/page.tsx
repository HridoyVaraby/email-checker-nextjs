'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader, { ParsedData } from '@/components/FileUploader';
import VerificationControls, { VerificationOptions } from '@/components/VerificationControls';
import StatsSummary, { VerificationStats } from '@/components/StatsSummary';
import ResultsTable, { TableRow } from '@/components/ResultsTable';
import DownloadButtons from '@/components/DownloadButtons';
import { showToast } from '@/components/Toast';

interface VerificationResultData {
    data: any[];
    stats: VerificationStats;
    emailColumn: string;
    filename: string;
}

export default function UploadPage() {
    const router = useRouter();
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [processedCount, setProcessedCount] = useState(0);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [verificationResult, setVerificationResult] = useState<VerificationResultData | null>(null);

    // Auto-select column when data is parsed
    useEffect(() => {
        if (parsedData?.emailColumn) {
            setSelectedColumn(parsedData.emailColumn);
        } else if (parsedData?.columns.length === 1) {
            setSelectedColumn(parsedData.columns[0]);
        }
    }, [parsedData]);

    const handleDataParsed = (data: ParsedData) => {
        setParsedData(data);
        setVerificationResult(null); // Reset results on new upload
        showToast.success(`Successfully parsed ${data.rowCount} rows`);
    };

    const handleError = (message: string) => {
        showToast.error(message);
    };

    const handleVerify = async (options: VerificationOptions) => {
        if (!parsedData || !selectedColumn) return;

        setIsVerifying(true);
        setProgress(0);
        setProcessedCount(0);
        setVerificationResult(null);

        const CHUNK_SIZE = 10;
        const totalRows = parsedData.data.length;
        const allResults: Record<string, unknown>[] = [];
        let completedCount = 0;

        try {
            // Process data in chunks
            for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
                const chunk = parsedData.data.slice(i, i + CHUNK_SIZE);

                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: chunk,
                        emailColumn: selectedColumn,
                        options
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Verification failed for batch ${i / CHUNK_SIZE + 1}`);
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Verification failed');
                }

                // Collect results
                allResults.push(...result.data);

                // Update progress
                completedCount += chunk.length;
                setProcessedCount(completedCount);
                setProgress((completedCount / totalRows) * 100);
            }

            // Calculate final stats locally
            const stats = {
                total: allResults.length,
                valid: allResults.filter((r: any) => r.verification_status === 'Valid').length,
                invalid: allResults.filter((r: any) => r.verification_status === 'Invalid').length,
                risky: allResults.filter((r: any) => r.verification_status === 'Risky').length,
                unknown: allResults.filter((r: any) => r.verification_status === 'Unknown').length,
            };

            // Set results directly in state instead of storage/navigation
            setVerificationResult({
                data: allResults,
                stats,
                emailColumn: selectedColumn,
                filename: parsedData.filename
            });

            showToast.success('Verification complete!');

        } catch (error) {
            console.error('Verification error:', error);
            showToast.error(error instanceof Error ? error.message : 'Verification failed');
            setProgress(0);
            setProcessedCount(0);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleStartOver = () => {
        setParsedData(null);
        setVerificationResult(null);
        setProcessedCount(0);
        setProgress(0);
        setSelectedColumn(null);
    };

    if (verificationResult) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-black mb-1">Verification Results</h1>
                            <p className="text-gray-600">
                                File: <span className="font-medium text-black">{verificationResult.filename}</span>
                            </p>
                        </div>

                        <button
                            onClick={handleStartOver}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Start New Verification
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Stats Summary */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <StatsSummary stats={verificationResult.stats} />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Results Table (2/3 width) */}
                            <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-black">Email List</h3>
                                </div>
                                <ResultsTable
                                    data={verificationResult.data}
                                    emailColumn={verificationResult.emailColumn}
                                />
                            </section>

                            {/* Download Options (1/3 width) */}
                            <div className="space-y-6">
                                <section className="sticky top-24">
                                    <DownloadButtons
                                        data={verificationResult.data}
                                    />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black mb-2">Upload Data</h1>
                    <p className="text-gray-600">
                        Upload your email list to start the verification process.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* File Uploader */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <FileUploader
                            onDataParsed={handleDataParsed}
                            onError={handleError}
                        />
                    </div>

                    {/* Verification Controls (only shown when data is loaded) */}
                    {parsedData && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <VerificationControls
                                columns={parsedData.columns}
                                selectedColumn={selectedColumn}
                                onColumnChange={setSelectedColumn}
                                onVerify={handleVerify}
                                isVerifying={isVerifying}
                                progress={progress}
                                processedCount={processedCount}
                                dataCount={parsedData.rowCount}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
