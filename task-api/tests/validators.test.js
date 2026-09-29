const {
    validateCreateTask,
    validateUpdateTask,
} = require('../src/utils/validators');

describe('validators', () => {
    test('should reject a task without a title', () => {
        const error = validateCreateTask({});

        expect(error).toBe('title is required and must be a non-empty string');
    });

    test('should reject an empty title', () => {
        const error = validateCreateTask({
            title: '',
        });

        expect(error).toBe('title is required and must be a non-empty string');
    });

    test('should reject a whitespace-only title', () => {
        const error = validateCreateTask({
            title: '   ',
        });

        expect(error).toBe('title is required and must be a non-empty string');
    });

    test('should reject a non-string title', () => {
        const error = validateCreateTask({
            title: 123,
        });

        expect(error).toBe('title is required and must be a non-empty string');
    });

    test('should reject an invalid status', () => {
        const error = validateCreateTask({
            title: 'Test task',
            status: 'invalid',
        });

        expect(error).toBe(
            'status must be one of: todo, in_progress, done'
        );
    });

    test('should reject an invalid priority', () => {
        const error = validateCreateTask({
            title: 'Test task',
            priority: 'urgent',
        });

        expect(error).toBe(
            'priority must be one of: low, medium, high'
        );
    });

    test('should reject an invalid dueDate', () => {
        const error = validateCreateTask({
            title: 'Test task',
            dueDate: 'not-a-date',
        });

        expect(error).toBe(
            'dueDate must be a valid ISO date string'
        );
    });

    test('should accept a valid task', () => {
        const error = validateCreateTask({
            title: 'Build portfolio',
            status: 'todo',
            priority: 'high',
            dueDate: '2026-10-01T10:00:00.000Z',
        });

        expect(error).toBeNull();
    });

    test('should accept a valid task update', () => {
        const error = validateUpdateTask({
            title: 'Updated task',
            status: 'in_progress',
            priority: 'high',
        });

        expect(error).toBeNull();
    });

    test('should reject an empty title when updating a task', () => {
        const error = validateUpdateTask({
            title: '',
        });

        expect(error).toBe(
            'title must be a non-empty string'
        );
    });
});