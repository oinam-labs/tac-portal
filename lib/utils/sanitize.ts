/**
 * Input Sanitization Utilities
 * Prevents XSS and injection attacks
 * Based on tac-code-reviewer security requirements
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for safe display
 * Removes potentially dangerous content
 */
export function sanitizeString(str: string | null | undefined): string {
    if (!str) return '';

    // Remove null bytes
    let sanitized = str.replace(/\0/g, '');

    // Strip HTML tags
    sanitized = stripHtml(sanitized);

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Sanitize object keys and string values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeString(key);

        if (typeof value === 'string') {
            sanitized[sanitizedKey] = sanitizeString(value);
        } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[sanitizedKey] = sanitizeObject(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
            sanitized[sanitizedKey] = value.map((item) =>
                typeof item === 'string' ? sanitizeString(item) : item
            );
        } else {
            sanitized[sanitizedKey] = value;
        }
    }

    return sanitized as T;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
    const sanitized = sanitizeString(email).toLowerCase();
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
        throw new Error('Invalid email format');
    }
    return sanitized;
}

/**
 * Sanitize phone number - keep only digits and + for country code
 */
export function sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize URL - validate and return or throw
 */
export function sanitizeUrl(url: string): string {
    const sanitized = sanitizeString(url);
    try {
        const parsed = new URL(sanitized);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid URL protocol');
        }
        return parsed.href;
    } catch {
        throw new Error('Invalid URL format');
    }
}

/**
 * Truncate string to max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

/**
 * Remove SQL injection patterns (for logging/display only - use parameterized queries for DB)
 */
export function removeSqlPatterns(str: string): string {
    // Remove common SQL injection patterns
    const sqlPatterns = [
        /(\s|^)(OR|AND)\s+\d+=\d+/gi,
        /--/g,
        /;.*$/g,
        /\/\*[\s\S]*?\*\//g,
        /'\s*(OR|AND)\s*'/gi,
        /UNION\s+(ALL\s+)?SELECT/gi,
        /DROP\s+TABLE/gi,
        /INSERT\s+INTO/gi,
        /DELETE\s+FROM/gi,
    ];

    let sanitized = str;
    for (const pattern of sqlPatterns) {
        sanitized = sanitized.replace(pattern, '');
    }
    return sanitized;
}
