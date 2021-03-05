import request from 'supertest';
import { getConnection } from 'typeorm';
import { app } from '../app';
import createConnection from '../database';

describe("Surveys", () => {
    beforeAll(async () => {
        const connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll( async () => {
        const connection = getConnection();
        await connection.dropDatabase();
        await connection.close();
    })

    it("Should be able to create new surveys", async () => {
        const response = await request(app).post("/surveys").send({
            title: "Title Test",
            description: "Description example",
        });
        expect(response.status).toBe(201);
    });
});