'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsSummary, { VerificationStats } from '@/components/StatsSummary';
import ResultsTable, { TableRow } from '@/components/ResultsTable';
import ServerDownloadButtons from '@/components/ServerDownloadButtons';

interface JobDetails {
    id: string;
    filename: string;
    status: string;
    totalRows: number;
    processedRows: number;
    emailColumn: string;
    stats: VerificationStats;
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);;
    const [job, setJob] = useState<JobDetails | null>(null);
    const [records, setRecords] = useState<TableRow[]>([]);
    const [loading, setLoading] = useState(true);

    // Poll for status
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/jobs/${id}`);
                const data = await res.json();
                if (data.success) {
                    setJob(data.data);

                    // Stop polling if completed or failed
                    if (data.data.status === 'COMPLETED' || data.data.status === 'FAILED') {
                        clearInterval(interval);
                        setLoading(false);
                        // Fetch preview records
                        fetchRecords(id);
                    } else {
                        setLoading(false); // Show initial info even if processing
                    }
                }
            } catch (error) {
                console.error('Error fetching job:', error);
            }
        };

        fetchJob();
        interval = setInterval(fetchJob, 2000); // Poll every 2s

        return () => clearInterval(interval);
    }, [id]);

    const fetchRecords = async (jobId: string) => {
        try {
            // Fetch first 100 records for preview
            const res = await fetch(`/api/jobs/${jobId}/records?limit=100`);
            const data = await res.json();
            if (data.success) {
                setRecords(data.data);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    if (loading && !job) {
        return <div className="p-12 text-center">Loading job details...</div>;
    }

    if (!job) {
        return <div className="p-12 text-center">Job not found.</div>;
    }

    const progress = job.totalRows > 0 ? (job.processedRows / job.totalRows) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href="/history" className="text-gray-500 hover:text-black mb-2 inline-block">← Back to History</Link>
                        <h1 className="text-3xl font-bold text-black">
                            Job: {job.filename}
                        </h1>
                        <p className="text-gray-600">ID: {job.id}</p>
                    </div>
                </div>

                {/* Progress Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Status: <span className={
                            job.status === 'COMPLETED' ? 'text-green-600' :
                                job.status === 'PROCESSING' ? 'text-blue-600' : 'text-gray-600'
                        }>{job.status}</span></h2>
                        <span className="text-sm text-gray-500">{job.processedRows} / {job.totalRows} Verified</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-black h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Stats & Results (only if completed) */}
                {job.status === 'COMPLETED' && (
                    <div className="space-y-8">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <StatsSummary stats={job.stats} />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold">Preview (First 100 Rows)</h3>
                                </div>
                                <ResultsTable data={records} emailColumn={job.emailColumn} />
                            </section>

                            <div className="space-y-6">
                                <ServerDownloadButtons jobId={job.id} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
