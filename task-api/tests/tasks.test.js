const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
    beforeEach(() => {
        taskService._reset();
    });

    test('should create a task', async () => {
        const response = await request(app)
            .post('/tasks')
            .send({
                title: 'Learn Express',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Learn Express');
        expect(response.body.status).toBe('todo');
    });

    test('should reject a task without a title', async () => {
        const response = await request(app)
            .post('/tasks')
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'title is required and must be a non-empty string'
        );
    });

    test('should return all tasks', async () => {
        await request(app)
            .post('/tasks')
            .send({
                title: 'Task A',
            });

        await request(app)
            .post('/tasks')
            .send({
                title: 'Task B',
            });

        const response = await request(app)
            .get('/tasks');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].title).toBe('Task A');
        expect(response.body[1].title).toBe('Task B');
    });

    test('should filter tasks by status', async () => {
        await request(app)
            .post('/tasks')
            .send({
                title: 'Task A',
                status: 'todo',
            });

        await request(app)
            .post('/tasks')
            .send({
                title: 'Task B',
                status: 'done',
            });

        const response = await request(app)
            .get('/tasks?status=todo');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Task A');
        expect(response.body[0].status).toBe('todo');
    });

    test('should return task statistics', async () => {
        await request(app)
            .post('/tasks')
            .send({
                title: 'Task A',
                status: 'todo',
            });

        await request(app)
            .post('/tasks')
            .send({
                title: 'Task B',
                status: 'in_progress',
            });

        await request(app)
            .post('/tasks')
            .send({
                title: 'Task C',
                status: 'done',
            });

        const response = await request(app)
            .get('/tasks/stats');

        expect(response.statusCode).toBe(200);
        expect(response.body.todo).toBe(1);
        expect(response.body.in_progress).toBe(1);
        expect(response.body.done).toBe(1);
        expect(response.body.overdue).toBe(0);
    });

    test('should update a task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({
                title: 'Original task',
                priority: 'low',
            });

        const taskId = createResponse.body.id;

        const response = await request(app)
            .put(`/tasks/${taskId}`)
            .send({
                title: 'Updated task',
                priority: 'high',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(taskId);
        expect(response.body.title).toBe('Updated task');
        expect(response.body.priority).toBe('high');
    });

    test('should return 404 when updating a non-existing task', async () => {
        const response = await request(app)
            .put('/tasks/non-existing-id')
            .send({
                title: 'Updated task',
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

    test('should delete a task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({
                title: 'Task to delete',
            });

        const taskId = createResponse.body.id;

        const response = await request(app)
            .delete(`/tasks/${taskId}`);

        expect(response.statusCode).toBe(204);

        const getResponse = await request(app)
            .get('/tasks');

        expect(getResponse.body).toHaveLength(0);
    });

    test('should return 404 when deleting a non-existing task', async () => {
        const response = await request(app)
            .delete('/tasks/non-existing-id');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

    test('should complete a task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({
                title: 'Finish assignment',
                status: 'todo',
            });

        const taskId = createResponse.body.id;

        const response = await request(app)
            .patch(`/tasks/${taskId}/complete`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(taskId);
        expect(response.body.status).toBe('done');
        expect(response.body.completedAt).not.toBeNull();
    });

    test('should return 404 when completing a non-existing task', async () => {
        const response = await request(app)
            .patch('/tasks/non-existing-id/complete');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

    test('should return paginated tasks', async () => {
        await request(app).post('/tasks').send({ title: 'Task A' });
        await request(app).post('/tasks').send({ title: 'Task B' });
        await request(app).post('/tasks').send({ title: 'Task C' });
        await request(app).post('/tasks').send({ title: 'Task D' });

        const response = await request(app)
            .get('/tasks?page=1&limit=2');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].title).toBe('Task A');
        expect(response.body[1].title).toBe('Task B');
    });

    test('should assign a task to a user', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({
                title: 'Complete assignment',
            });

        const taskId = createResponse.body.id;

        const response = await request(app)
            .patch(`/tasks/${taskId}/assign`)
            .send({
                assignee: 'Yasmeen',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(taskId);
        expect(response.body.assignee).toBe('Yasmeen');
    });

    test('should reject an empty assignee', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({
                title: 'Task to assign',
            });

        const taskId = createResponse.body.id;

        const response = await request(app)
            .patch(`/tasks/${taskId}/assign`)
            .send({
                assignee: '',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'assignee is required and must be a non-empty string'
        );
    });

    test('should return 404 when assigning a non-existing task', async () => {
        const response = await request(app)
            .patch('/tasks/non-existing-id/assign')
            .send({
                assignee: 'Yasmeen',
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

    test('should allow reassigning an already assigned task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({
                title: 'Task to reassign',
            });

        const taskId = createResponse.body.id;

        await request(app)
            .patch(`/tasks/${taskId}/assign`)
            .send({
                assignee: 'Yasmeen',
            });

        const response = await request(app)
            .patch(`/tasks/${taskId}/assign`)
            .send({
                assignee: 'Ali',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.assignee).toBe('Ali');
    });

});
