'use client';

/**
 * FileUploader Component
 * 
 * Drag-and-drop file upload with support for CSV, Excel, and JSON files.
 * Includes file preview and automatic email column detection.
 */

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Type for parsed data
export interface ParsedData {
    data: Record<string, unknown>[];
    columns: string[];
    emailColumn: string | null;
    filename: string;
    rowCount: number;
    file: File;
}

interface FileUploaderProps {
    onDataParsed: (result: ParsedData) => void;
    onError: (message: string) => void;
}

// Email column name patterns to auto-detect
const EMAIL_PATTERNS = [
    'email', 'e-mail', 'e_mail', 'emailaddress', 'email_address', 'email-address',
    'mail', 'correo', 'courriel', 'メール', '邮箱', 'email_id', 'user_email',
    'contact_email', 'primary_email', 'work_email', 'personal_email'
];

export default function FileUploader({ onDataParsed, onError }: FileUploaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
    const [detectedColumn, setDetectedColumn] = useState<string | null>(null);

    // Detect email column from column names
    const detectEmailColumn = (columns: string[]): string | null => {
        const lowerColumns = columns.map(c => c.toLowerCase().trim());

        for (const pattern of EMAIL_PATTERNS) {
            const index = lowerColumns.findIndex(c => c === pattern || c.includes(pattern));
            if (index !== -1) {
                return columns[index];
            }
        }

        return null;
    };

    // Parse CSV file
    const parseCSV = (file: File): Promise<Record<string, unknown>[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(results.errors[0].message));
                    } else {
                        resolve(results.data as Record<string, unknown>[]);
                    }
                },
                error: (error) => reject(error)
            });
        });
    };

    // Parse Excel file
    const parseExcel = (file: File): Promise<Record<string, unknown>[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(jsonData as Record<string, unknown>[]);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    };

    // Parse JSON file
    const parseJSON = (file: File): Promise<Record<string, unknown>[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);

                    if (Array.isArray(data)) {
                        resolve(data);
                    } else if (typeof data === 'object' && data !== null) {
                        // Try to find array in common keys
                        const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
                        if (arrayKey) {
                            resolve(data[arrayKey]);
                        } else {
                            resolve([data]); // Single object
                        }
                    } else {
                        reject(new Error('Invalid JSON format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    // Handle file processing
    const processFile = async (file: File) => {
        setIsLoading(true);

        try {
            let data: Record<string, unknown>[];
            const extension = file.name.split('.').pop()?.toLowerCase();

            switch (extension) {
                case 'csv':
                    data = await parseCSV(file);
                    break;
                case 'xlsx':
                case 'xls':
                    data = await parseExcel(file);
                    break;
                case 'json':
                    data = await parseJSON(file);
                    break;
                default:
                    throw new Error(`Unsupported file format: ${extension}`);
            }

            if (!data || data.length === 0) {
                throw new Error('File contains no data');
            }

            const columns = Object.keys(data[0]);
            const emailColumn = detectEmailColumn(columns);

            // Set preview (first 10 rows)
            setPreview(data.slice(0, 10));
            setDetectedColumn(emailColumn);

            // Callback with parsed data
            onDataParsed({
                data,
                columns,
                emailColumn,
                filename: file.name,
                rowCount: data.length,
                file: file
            });

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to parse file';
            onError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Dropzone configuration
    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        if (rejectedFiles.length > 0) {
            onError('Invalid file type. Please upload CSV, Excel, or JSON files.');
            return;
        }

        if (acceptedFiles.length > 0) {
            processFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/json': ['.json']
        },
        maxFiles: 1
    });

    return (
        <div className="w-full">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive
                        ? 'border-black bg-gray-100'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
            >
                <input {...getInputProps()} />

                {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600">Processing file...</p>
                    </div>
                ) : isDragActive ? (
                    <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-black font-medium">Drop file here</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                            <p className="text-gray-700 font-medium">
                                Drag & drop your file here
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                                or click to browse
                            </p>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                            Supports CSV, Excel (.xlsx, .xls), and JSON files
                        </p>
                    </div>
                )}
            </div>

            {/* Preview Table */}
            {preview && preview.length > 0 && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-black">Preview (First 10 rows)</h3>
                        {detectedColumn && (
                            <span className="text-sm text-gray-600">
                                Detected email column: <span className="font-medium text-black">{detectedColumn}</span>
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {Object.keys(preview[0]).map((col) => (
                                        <th
                                            key={col}
                                            className={`
                        px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                        ${col === detectedColumn ? 'bg-black text-white' : 'text-gray-700'}
                      `}
                                        >
                                            {col}
                                            {col === detectedColumn && (
                                                <span className="ml-2 text-xs font-normal lowercase">(email)</span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {preview.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {Object.entries(row).map(([key, value], colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={`
                          px-4 py-2 text-sm whitespace-nowrap
                          ${key === detectedColumn ? 'font-medium text-black' : 'text-gray-600'}
                        `}
                                            >
                                                {String(value ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
