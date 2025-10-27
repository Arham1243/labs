import { describe, expect, it } from 'vitest';
import ValidationException from '@/composables/validation-exception';

describe('ValidationException', () => {
    it('creates an instance with the correct properties', () => {
        const field = 'username';
        const message = 'Username is required';
        const exception = new ValidationException(field, message);

        // Check that it extends Error
        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(ValidationException);

        // Check name property
        expect(exception.name).toBe('ValidationException');

        // Check message property
        expect(exception.message).toBe(message);

        // Check response structure
        expect(exception.response).toBeDefined();
        expect(exception.response.data).toBeDefined();
        expect(exception.response.data.errors).toBeDefined();
        expect(exception.response.data.errors[field]).toEqual([message]);
        expect(exception.response.data.message).toBe(message);
    });

    it('handles different field and message values', () => {
        const field = 'email';
        const message = 'Invalid email format';
        const exception = new ValidationException(field, message);

        expect(exception.response.data.errors[field]).toEqual([message]);
        expect(exception.response.data.message).toBe(message);
    });
});
