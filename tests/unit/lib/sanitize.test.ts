import { describe, it, expect } from 'vitest';
import {
    escapeHtml,
    stripHtml,
    sanitizeString,
    sanitizeObject,
    sanitizeEmail,
    sanitizePhone,
    sanitizeUrl,
    truncate,
    removeSqlPatterns,
} from '@/lib/utils/sanitize';

describe('Sanitization Utilities', () => {
    describe('escapeHtml', () => {
        it('escapes HTML special characters', () => {
            expect(escapeHtml('<script>alert("xss")</script>')).toBe(
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
            );
        });

        it('escapes ampersand', () => {
            expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
        });

        it('escapes quotes', () => {
            expect(escapeHtml("It's a \"test\"")).toBe("It&#x27;s a &quot;test&quot;");
        });

        it('handles empty string', () => {
            expect(escapeHtml('')).toBe('');
        });
    });

    describe('stripHtml', () => {
        it('removes HTML tags', () => {
            expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World');
        });

        it('removes script tags', () => {
            expect(stripHtml('<script>alert("xss")</script>Safe text')).toBe(
                'alert("xss")Safe text'
            );
        });

        it('handles self-closing tags', () => {
            expect(stripHtml('Line 1<br/>Line 2')).toBe('Line 1Line 2');
        });

        it('handles empty string', () => {
            expect(stripHtml('')).toBe('');
        });
    });

    describe('sanitizeString', () => {
        it('removes null bytes', () => {
            expect(sanitizeString('hello\0world')).toBe('helloworld');
        });

        it('strips HTML and trims', () => {
            expect(sanitizeString('  <b>Hello</b>  ')).toBe('Hello');
        });

        it('handles null input', () => {
            expect(sanitizeString(null)).toBe('');
        });

        it('handles undefined input', () => {
            expect(sanitizeString(undefined)).toBe('');
        });
    });

    describe('sanitizeObject', () => {
        it('sanitizes string values', () => {
            const input = { name: '  <script>test</script>  ', age: 25 };
            const result = sanitizeObject(input);
            expect(result.name).toBe('test');
            expect(result.age).toBe(25);
        });

        it('sanitizes nested objects', () => {
            const input = {
                user: {
                    name: '<b>John</b>',
                    email: '  john@test.com  ',
                },
            };
            const result = sanitizeObject(input);
            expect(result.user.name).toBe('John');
            expect(result.user.email).toBe('john@test.com');
        });

        it('sanitizes arrays of strings', () => {
            const input = { tags: ['<b>tag1</b>', 'tag2', '  tag3  '] };
            const result = sanitizeObject(input);
            expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
        });

        it('preserves non-string values', () => {
            const input = { count: 42, active: true, data: null };
            const result = sanitizeObject(input);
            expect(result).toEqual(input);
        });
    });

    describe('sanitizeEmail', () => {
        it('sanitizes and lowercases valid email', () => {
            expect(sanitizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
        });

        it('throws on invalid email', () => {
            expect(() => sanitizeEmail('not-an-email')).toThrow('Invalid email format');
        });

        it('throws on empty string', () => {
            expect(() => sanitizeEmail('')).toThrow('Invalid email format');
        });
    });

    describe('sanitizePhone', () => {
        it('keeps only digits and plus sign', () => {
            expect(sanitizePhone('+1 (555) 123-4567')).toBe('+15551234567');
        });

        it('handles plain numbers', () => {
            expect(sanitizePhone('9876543210')).toBe('9876543210');
        });

        it('removes all non-numeric characters except +', () => {
            expect(sanitizePhone('phone: +91-98765-43210')).toBe('+919876543210');
        });
    });

    describe('sanitizeUrl', () => {
        it('validates and returns valid https URL', () => {
            expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
        });

        it('validates and returns valid http URL', () => {
            expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
        });

        it('throws on javascript: protocol', () => {
            expect(() => sanitizeUrl('javascript:alert(1)')).toThrow();
        });

        it('throws on invalid URL', () => {
            expect(() => sanitizeUrl('not a url')).toThrow('Invalid URL format');
        });

        it('throws on data: protocol', () => {
            expect(() => sanitizeUrl('data:text/html,<script>alert(1)</script>')).toThrow();
        });
    });

    describe('truncate', () => {
        it('truncates long strings', () => {
            expect(truncate('Hello World', 8)).toBe('Hello...');
        });

        it('does not truncate short strings', () => {
            expect(truncate('Hello', 10)).toBe('Hello');
        });

        it('handles exact length', () => {
            expect(truncate('Hello', 5)).toBe('Hello');
        });

        it('handles very short max length', () => {
            expect(truncate('Hello World', 4)).toBe('H...');
        });
    });

    describe('removeSqlPatterns', () => {
        it('removes OR 1=1 pattern', () => {
            expect(removeSqlPatterns("test OR 1=1")).toBe("test");
        });

        it('removes SQL comments', () => {
            expect(removeSqlPatterns('SELECT *-- comment')).toBe('SELECT * comment');
        });

        it('removes UNION SELECT', () => {
            expect(removeSqlPatterns('1 UNION SELECT * FROM users')).toBe('1  * FROM users');
        });

        it('removes DROP TABLE', () => {
            expect(removeSqlPatterns('DROP TABLE users')).toBe(' users');
        });

        it('removes block comments', () => {
            expect(removeSqlPatterns('SELECT /* comment */ *')).toBe('SELECT  *');
        });

        it('preserves safe strings', () => {
            expect(removeSqlPatterns('John Doe')).toBe('John Doe');
        });
    });
});
