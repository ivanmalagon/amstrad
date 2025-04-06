/**
 * Formats a date string in the format 'YYYY-MM-DD' to a more readable format
 * @param dateString - Date string in format 'YYYY-MM-DD'
 * @returns Formatted date string like "Feb 27, '24"
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    
    return `${month} ${day}, '${year}`;
} 