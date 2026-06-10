const request = require("supertest");
const app = require("../../app");

let accessToken, refreshToken;

describe("Auth Endpoints", () => {
  it("POST /api/auth/register - creates a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: `test${Date.now()}@x.com`,
      password: "pass123", role: "dev",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
  });

  it("POST /api/auth/login - returns tokens", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "dev@shipyard.dev", password: "dev123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("POST /api/auth/login - rejects bad credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "dev@shipyard.dev", password: "wrongpass",
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/auth/refresh - returns new access token", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("POST /api/auth/logout - invalidates refresh token", async () => {
    const res = await request(app).post("/api/auth/logout").send({ refreshToken });
    expect(res.statusCode).toBe(200);
  });
});