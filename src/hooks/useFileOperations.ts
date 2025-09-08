import { useState, useCallback } from 'react';

export interface UseFileOperationsReturn {
    importData: (file: File) => Promise<any>;
    exportData: (data: any, filename: string, type?: 'json' | 'csv') => void;
    loading: boolean;
    error: string | null;
}

export function useFileOperations(): UseFileOperationsReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const fileInputRef = useRef<HTMLInputElement>(null); // Currently unused

    const importData = useCallback(async (file: File): Promise<any> => {
        setLoading(true);
        setError(null);

        try {
            const text = await file.text();
            let data;

            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                data = JSON.parse(text);
            } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                data = parseCSV(text);
            } else {
                throw new Error('Unsupported file type. Please upload a JSON or CSV file.');
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to import file';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportData = useCallback((data: any, filename: string, type: 'json' | 'csv' = 'json') => {
        setError(null);

        try {
            let content: string;
            let mimeType: string;

            if (type === 'json') {
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
            } else {
                content = convertToCSV(data);
                mimeType = 'text/csv';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
            setError(errorMessage);
        }
    }, []);

    return {
        importData,
        exportData,
        loading,
        error,
    };
}

// Utility function to parse CSV
function parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
        const row: any = {};

        headers.forEach((header, index) => {
            const value = values[index] || '';
            // Try to parse as number if it looks like a number
            if (value && !isNaN(Number(value))) {
                row[header] = Number(value);
            } else if (value === 'true' || value === 'false') {
                row[header] = value === 'true';
            } else {
                row[header] = value;
            }
        });

        rows.push(row);
    }

    return rows;
}

// Utility function to convert data to CSV
function convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        // Header row
        headers.map(header => `"${header}"`).join(','),
        // Data rows
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) {
                    return '""';
                }
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return `"${String(value)}"`;
            }).join(',')
        ),
    ].join('\n');

    return csvContent;
}

export interface UseLocalStorageReturn<T> {
    value: T;
    setValue: (value: T | ((prevValue: T) => T)) => void;
    clearValue: () => void;
    loading: boolean;
    error: string | null;
}

export function useLocalStorage<T>(
    key: string,
    defaultValue: T
): UseLocalStorageReturn<T> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [value, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === 'undefined') {
                return defaultValue;
            }

            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (err) {
            console.error(`Error reading localStorage key "${key}":`, err);
            return defaultValue;
        }
    });

    const setValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
        try {
            setError(null);
            setLoading(true);

            const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save to localStorage';
            setError(errorMessage);
            console.error(`Error setting localStorage key "${key}":`, err);
        } finally {
            setLoading(false);
        }
    }, [key, value]);

    const clearValue = useCallback(() => {
        try {
            setError(null);
            setStoredValue(defaultValue);

            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to clear localStorage';
            setError(errorMessage);
            console.error(`Error clearing localStorage key "${key}":`, err);
        }
    }, [key, defaultValue]);

    return {
        value,
        setValue,
        clearValue,
        loading,
        error,
    };
}
