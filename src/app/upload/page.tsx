'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader, { ParsedData } from '@/components/FileUploader';
import VerificationControls, { VerificationOptions } from '@/components/VerificationControls';
import { showToast } from '@/components/Toast';

export default function UploadPage() {
    const router = useRouter();
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [processedCount, setProcessedCount] = useState(0);
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
        // Fake progress for upload phase
        setProgress(10);

        try {
            // 1. Create Job (Upload File)
            const formData = new FormData();
            formData.append('file', parsedData.file);
            formData.append('emailColumn', selectedColumn);

            const uploadRes = await fetch('/api/jobs', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Failed to upload file');
            const uploadData = await uploadRes.json();

            if (!uploadData.success) throw new Error(uploadData.message);
            const jobId = uploadData.data.id;

            setProgress(50);

            // 2. Start Processing
            const startRes = await fetch(`/api/jobs/${jobId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
            });

            if (!startRes.ok) throw new Error('Failed to start processing');
            const startData = await startRes.json();

            if (!startData.success) throw new Error(startData.message);

            setProgress(100);
            showToast.success('Verification started!');

            // 3. Redirect to Status/History Page
            router.push(`/history/${jobId}`);

        } catch (error) {
            console.error('Verification initiation error:', error);
            showToast.error(error instanceof Error ? error.message : 'Failed to start verification');
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
                        Upload your email list to start the verification process. The process will run in the background.
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
