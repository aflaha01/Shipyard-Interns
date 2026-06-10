const request = require("supertest");
const app = require("../../app");

let adminToken, devToken, projectId;

beforeAll(async () => {
  const adminRes = await request(app).post("/api/auth/login").send({ email: "admin@shipyard.dev", password: "admin123" });
  adminToken = adminRes.body.accessToken;
  const devRes = await request(app).post("/api/auth/login").send({ email: "dev@shipyard.dev", password: "dev123" });
  devToken = devRes.body.accessToken;
});

describe("Project Endpoints", () => {
  it("GET /api/projects - requires auth", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/projects - dev can create project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${devToken}`)
      .send({ name: "Test Project", description: "desc", status: "active" });
    expect(res.statusCode).toBe(201);
    projectId = res.body.id;
  });

  it("GET /api/projects - lists with pagination", async () => {
    const res = await request(app)
      .get("/api/projects?page=1&limit=5")
      .set("Authorization", `Bearer ${devToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /api/projects/:id - gets single project", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${devToken}`);
    expect(res.statusCode).toBe(200);
  });

  it("PUT /api/projects/:id - owner can update", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${devToken}`)
      .send({ status: "inactive" });
    expect(res.statusCode).toBe(200);
  });

  it("PUT /api/projects/:id - admin can update any project", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Admin Updated" });
    expect(res.statusCode).toBe(200);
  });

  it("DELETE /api/projects/:id - owner can delete", async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${devToken}`);
    expect(res.statusCode).toBe(200);
  });
});