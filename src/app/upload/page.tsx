'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader, { ParsedData } from '@/components/FileUploader';
import VerificationControls, { VerificationOptions } from '@/components/VerificationControls';
import { showToast } from '@/components/Toast';

export default function UploadPage() {
    const router = useRouter();
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [progress, setProgress] = useState(0);

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
        showToast.success(`Successfully parsed ${data.rowCount} rows`);
    };

    const handleError = (message: string) => {
        showToast.error(message);
    };

    const handleVerify = async (options: VerificationOptions) => {
        if (!parsedData || !selectedColumn) return;

        setIsVerifying(true);
        setProgress(10); // Start progress

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 500);

            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: parsedData.data,
                    emailColumn: selectedColumn,
                    options
                }),
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                throw new Error('Verification failed');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Verification failed');
            }

            // Save results to sessionStorage for the results page
            sessionStorage.setItem('verificationResults', JSON.stringify({
                data: result.data,
                stats: result.stats,
                emailColumn: selectedColumn,
                filename: parsedData.filename
            }));

            showToast.success('Verification complete!');

            // Navigate to results
            setTimeout(() => {
                router.push('/results');
            }, 500);

        } catch (error) {
            console.error('Verification error:', error);
            showToast.error(error instanceof Error ? error.message : 'Verification failed');
            setIsVerifying(false);
            setProgress(0);
        }
    };

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
                                dataCount={parsedData.rowCount}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
