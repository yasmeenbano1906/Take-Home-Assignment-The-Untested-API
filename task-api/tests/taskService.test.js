const taskService = require('../src/services/taskService');

describe('taskService', () => {
    beforeEach(() => {
        taskService._reset();
    });

    test('should create a task', () => {
        const task = taskService.create({
            title: 'Learn Jest',
        });

        expect(task).toHaveProperty('id');
        expect(task.title).toBe('Learn Jest');
        expect(task.status).toBe('todo');
        expect(task.priority).toBe('medium');
    });

    test('should find a task by id', () => {
        const createdTask = taskService.create({
            title: 'Learn Node.js',
        });

        const foundTask = taskService.findById(createdTask.id);

        expect(foundTask).toEqual(createdTask);
    });

    test('should return all tasks', () => {
        taskService.create({
            title: 'Learn JavaScript',
        });

        taskService.create({
            title: 'Learn Jest',
        });

        const tasks = taskService.getAll();

        expect(tasks).toHaveLength(2);
        expect(tasks[0].title).toBe('Learn JavaScript');
        expect(tasks[1].title).toBe('Learn Jest');
    });

    test('should return tasks by status', () => {
        taskService.create({
            title: 'Learn React',
            status: 'todo',
        });

        taskService.create({
            title: 'Build API',
            status: 'in_progress',
        });

        taskService.create({
            title: 'Learn Jest',
            status: 'todo',
        });

        const tasks = taskService.getByStatus('todo');

        expect(tasks).toHaveLength(2);
        expect(tasks[0].title).toBe('Learn React');
        expect(tasks[1].title).toBe('Learn Jest');
    });

    test('should return paginated tasks', () => {
        taskService.create({ title: 'Task A' });
        taskService.create({ title: 'Task B' });
        taskService.create({ title: 'Task C' });
        taskService.create({ title: 'Task D' });
        taskService.create({ title: 'Task E' });

        const tasks = taskService.getPaginated(1, 2);

        expect(tasks).toHaveLength(2);
        expect(tasks[0].title).toBe('Task A');
        expect(tasks[1].title).toBe('Task B');
    });

    test('should update a task', () => {
        const task = taskService.create({
            title: 'Learn JavaScript',
            priority: 'low',
        });

        const updatedTask = taskService.update(task.id, {
            title: 'Learn Advanced JavaScript',
            priority: 'high',
        });

        expect(updatedTask.title).toBe('Learn Advanced JavaScript');
        expect(updatedTask.priority).toBe('high');
        expect(updatedTask.id).toBe(task.id);
    });

    test('should return null when updating a non-existing task', () => {
        const updatedTask = taskService.update('non-existing-id', {
            title: 'Updated Task',
        });

        expect(updatedTask).toBeNull();
    });

    test('should remove a task', () => {
        const task = taskService.create({
            title: 'Task to delete',
        });

        const result = taskService.remove(task.id);

        expect(result).toBe(true);
        expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('should return false when removing a non-existing task', () => {
        const result = taskService.remove('non-existing-id');

        expect(result).toBe(false);
    });

    test('should complete a task', () => {
        const task = taskService.create({
            title: 'Finish assignment',
        });

        const completedTask = taskService.completeTask(task.id);

        expect(completedTask.status).toBe('done');
        expect(completedTask.completedAt).not.toBeNull();
        expect(completedTask.id).toBe(task.id);
    });

    test('should return null when completing a non-existing task', () => {
        const result = taskService.completeTask('non-existing-id');

        expect(result).toBeNull();
    });

    test('should return task statistics', () => {
        taskService.create({
            title: 'Task A',
            status: 'todo',
        });

        taskService.create({
            title: 'Task B',
            status: 'in_progress',
        });

        taskService.create({
            title: 'Task C',
            status: 'done',
        });

        const stats = taskService.getStats();

        expect(stats.todo).toBe(1);
        expect(stats.in_progress).toBe(1);
        expect(stats.done).toBe(1);
        expect(stats.overdue).toBe(0);
    });

    test('should count overdue tasks', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        taskService.create({
            title: 'Overdue task',
            status: 'todo',
            dueDate: yesterday,
        });

        const stats = taskService.getStats();

        expect(stats.overdue).toBe(1);
    });

    test('should not count a completed task as overdue', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        taskService.create({
            title: 'Completed overdue task',
            status: 'done',
            dueDate: yesterday,
        });

        const stats = taskService.getStats();

        expect(stats.overdue).toBe(0);
    });
});