import request from 'supertest';
import { app } from '../app';
import createConnection from '../database';

describe("Surveys", () => {
    beforeAll(async () => {
        const connection = await createConnection();
        await connection.runMigrations();
    });

    it("Should be able to create new surveys", async () => {
        const response = await request(app).post("/surveys").send({
            title: "Title Test",
            description: "Description example",
        });
        expect(response.status).toBe(201);
    });
});