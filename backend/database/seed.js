require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const users = [
  { name: "Alice Admin", email: "admin@shipyard.dev", password: "admin123", role: "admin" },
  { name: "Leo Lead",    email: "lead@shipyard.dev",  password: "lead123",  role: "lead"  },
  { name: "Dev Dana",   email: "dev@shipyard.dev",   password: "dev123",   role: "dev"   },
];

const projects = [
  { name: "Alpha", description: "First project",  status: "active",   ownerEmail: "lead@shipyard.dev" },
  { name: "Beta",  description: "Second project", status: "inactive", ownerEmail: "dev@shipyard.dev"  },
];

setTimeout(() => {
  db.serialize(() => {
    db.run("DELETE FROM projects");
    db.run("DELETE FROM users");

    users.forEach(({ name, email, password, role }) => {
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, bcrypt.hashSync(password, 10), role]
      );
    });

    // Insert projects after users
    setTimeout(() => {
      projects.forEach(({ name, description, status, ownerEmail }) => {
        db.get("SELECT id FROM users WHERE email = ?", [ownerEmail], (err, user) => {
          if (user) {
            db.run(
              "INSERT INTO projects (name, description, owner_id, status) VALUES (?, ?, ?, ?)",
              [name, description, user.id, status]
            );
          }
        });
      });
      console.log("✅ Seed complete");
    }, 300);
  });
}, 500);