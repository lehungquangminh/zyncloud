
export function generateTicketNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const uniquePart = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random alphanumeric characters
    return `TKT-${year}${month}${day}-${uniquePart}`;
}
