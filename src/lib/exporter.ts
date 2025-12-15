/**
 * Export Utilities Library
 * 
 * Provides functions to export verification results in various formats:
 * - CSV export
 * - Excel export
 * - Filtered exports (valid-only, risky-only, etc.)
 */

import * as XLSX from 'xlsx';
import { VerificationStatus } from './emailValidator';

// Type for a single data record
export interface DataRecord {
    [key: string]: string | number | boolean | null | undefined;
}

// Type for verification result to be exported
export interface ExportableResult extends DataRecord {
    verification_status?: VerificationStatus;
}

/**
 * Convert data array to CSV string
 * @param data - Array of data objects
 * @param columns - Optional column order
 * @returns CSV string
 */
export function toCSV(
    data: ExportableResult[],
    columns?: string[]
): string {
    if (!data || data.length === 0) {
        return '';
    }

    // Get columns from first row if not provided
    const cols = columns || Object.keys(data[0]);

    // Create header row
    const header = cols.map(col => escapeCSVValue(col)).join(',');

    // Create data rows
    const rows = data.map(row =>
        cols.map(col => escapeCSVValue(String(row[col] ?? ''))).join(',')
    );

    return [header, ...rows].join('\n');
}

/**
 * Escape a value for CSV format
 */
function escapeCSVValue(value: string): string {
    // If value contains comma, quote, or newline, wrap in quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        // Escape quotes by doubling them
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Convert data array to Excel workbook buffer
 * @param data - Array of data objects
 * @param sheetName - Name for the worksheet
 * @returns Excel workbook as Uint8Array
 */
export function toExcel(
    data: ExportableResult[],
    sheetName: string = 'Results'
): Uint8Array {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const buffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
    });

    return new Uint8Array(buffer);
}

/**
 * Filter data by verification status
 * @param data - Array of data with verification_status
 * @param statuses - Array of statuses to include
 * @returns Filtered data array
 */
export function filterByStatus(
    data: ExportableResult[],
    statuses: VerificationStatus[]
): ExportableResult[] {
    return data.filter(row =>
        statuses.includes(row.verification_status as VerificationStatus)
    );
}

/**
 * Get only valid emails
 */
export function getValidOnly(data: ExportableResult[]): ExportableResult[] {
    return filterByStatus(data, ['Valid']);
}

/**
 * Get only risky emails (disposable, role-based, etc.)
 */
export function getRiskyOnly(data: ExportableResult[]): ExportableResult[] {
    return filterByStatus(data, ['Risky']);
}

/**
 * Get only invalid emails
 */
export function getInvalidOnly(data: ExportableResult[]): ExportableResult[] {
    return filterByStatus(data, ['Invalid']);
}

/**
 * Get emails that need review (risky + unknown)
 */
export function getNeedsReview(data: ExportableResult[]): ExportableResult[] {
    return filterByStatus(data, ['Risky', 'Unknown']);
}

/**
 * Generate download filename with timestamp
 * @param prefix - Filename prefix
 * @param extension - File extension
 * @returns Formatted filename
 */
export function generateFilename(
    prefix: string = 'email-verification',
    extension: string = 'csv'
): string {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .substring(0, 19);

    return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Create a downloadable blob from CSV string
 */
export function createCSVBlob(csvString: string): Blob {
    return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Create a downloadable blob from Excel buffer
 */
export function createExcelBlob(excelBuffer: Uint8Array): Blob {
    return new Blob([excelBuffer.buffer as any], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
}

/**
 * Trigger browser download of a blob
 * @param blob - File blob
 * @param filename - Download filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export data as CSV download
 */
export function exportAsCSV(
    data: ExportableResult[],
    filename?: string
): void {
    const csv = toCSV(data);
    const blob = createCSVBlob(csv);
    const name = filename || generateFilename('email-verification', 'csv');
    downloadBlob(blob, name);
}

/**
 * Export data as Excel download
 */
export function exportAsExcel(
    data: ExportableResult[],
    filename?: string
): void {
    const excel = toExcel(data);
    const blob = createExcelBlob(excel);
    const name = filename || generateFilename('email-verification', 'xlsx');
    downloadBlob(blob, name);
}
