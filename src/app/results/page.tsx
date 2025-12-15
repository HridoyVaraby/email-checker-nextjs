'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsSummary, { VerificationStats } from '@/components/StatsSummary';
import ResultsTable, { TableRow } from '@/components/ResultsTable';
import DownloadButtons from '@/components/DownloadButtons';

interface ResultsData {
    data: TableRow[];
    stats: VerificationStats;
    emailColumn: string;
    filename: string;
}

export default function ResultsPage() {
    const router = useRouter();
    const [results, setResults] = useState<ResultsData | null>(null);

    useEffect(() => {
        // Load data from session storage
        try {
            const storedData = sessionStorage.getItem('verificationResults');
            if (!storedData) {
                router.push('/upload');
                return;
            }
            setResults(JSON.parse(storedData));
        } catch (error) {
            console.error('Failed to load results:', error);
            router.push('/upload');
        }
    }, [router]);

    if (!results) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href="/upload"
                                className="text-gray-400 hover:text-black transition-colors"
                                title="Back to Upload"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-3xl font-bold text-black">Verification Results</h1>
                        </div>
                        <p className="text-gray-600">
                            File: <span className="font-medium text-black">{results.filename}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/upload"
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Start New Verification
                        </Link>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Stats Summary */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <StatsSummary stats={results.stats} />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Results Table (2/3 width) */}
                        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-black">Email List</h3>
                            </div>
                            <ResultsTable
                                data={results.data}
                                emailColumn={results.emailColumn}
                            />
                        </section>

                        {/* Download Options (1/3 width) */}
                        <div className="space-y-6">
                            <section className="sticky top-24">
                                <DownloadButtons
                                    data={results.data as Record<string, unknown>[]}
                                />
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
