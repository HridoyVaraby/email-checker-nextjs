'use client';

/**
 * StatsSummary Component
 * 
 * Displays verification statistics in card format:
 * - Total emails
 * - Valid count
 * - Invalid count
 * - Risky count
 * - Unknown count
 */

import React from 'react';

export interface VerificationStats {
    total: number;
    valid: number;
    invalid: number;
    risky: number;
    unknown: number;
}

interface StatsSummaryProps {
    stats: VerificationStats;
}

export default function StatsSummary({ stats }: StatsSummaryProps) {
    const statCards = [
        {
            label: 'Total',
            value: stats.total,
            color: 'bg-gray-100 border-gray-300',
            textColor: 'text-gray-800',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            label: 'Valid',
            value: stats.valid,
            color: 'bg-white border-black border-2',
            textColor: 'text-black',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Invalid',
            value: stats.invalid,
            color: 'bg-black border-black',
            textColor: 'text-white',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Risky',
            value: stats.risky,
            color: 'bg-gray-400 border-gray-400',
            textColor: 'text-white',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        {
            label: 'Unknown',
            value: stats.unknown,
            color: 'bg-white border-gray-300 border-2',
            textColor: 'text-gray-600',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    // Calculate percentages
    const getPercentage = (value: number): string => {
        if (stats.total === 0) return '0%';
        return `${Math.round((value / stats.total) * 100)}%`;
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-black mb-4">Verification Summary</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`
              ${card.color} rounded-lg p-4 border transition-transform hover:scale-105
            `}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`${card.textColor} opacity-80`}>
                                {card.icon}
                            </span>
                            {stats.total > 0 && card.label !== 'Total' && (
                                <span className={`text-xs ${card.textColor} opacity-70`}>
                                    {getPercentage(card.value)}
                                </span>
                            )}
                        </div>
                        <p className={`text-2xl font-bold ${card.textColor}`}>
                            {card.value.toLocaleString()}
                        </p>
                        <p className={`text-sm ${card.textColor} opacity-80`}>
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Progress Bar Visualization */}
            {stats.total > 0 && (
                <div className="mt-6">
                    <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                        {stats.valid > 0 && (
                            <div
                                className="bg-white border-2 border-black transition-all duration-500"
                                style={{ width: getPercentage(stats.valid) }}
                                title={`Valid: ${stats.valid}`}
                            />
                        )}
                        {stats.invalid > 0 && (
                            <div
                                className="bg-black transition-all duration-500"
                                style={{ width: getPercentage(stats.invalid) }}
                                title={`Invalid: ${stats.invalid}`}
                            />
                        )}
                        {stats.risky > 0 && (
                            <div
                                className="bg-gray-400 transition-all duration-500"
                                style={{ width: getPercentage(stats.risky) }}
                                title={`Risky: ${stats.risky}`}
                            />
                        )}
                        {stats.unknown > 0 && (
                            <div
                                className="bg-gray-200 transition-all duration-500"
                                style={{ width: getPercentage(stats.unknown) }}
                                title={`Unknown: ${stats.unknown}`}
                            />
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-black bg-white rounded" />
                            <span className="text-gray-600">Valid</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-black rounded" />
                            <span className="text-gray-600">Invalid</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded" />
                            <span className="text-gray-600">Risky</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded" />
                            <span className="text-gray-600">Unknown</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
