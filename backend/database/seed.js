require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const { User, Project, syncDB } = require("../src/models");

const seed = async () => {
  await syncDB();

  await User.destroy({ truncate: true });
  await Project.destroy({ truncate: true });

  const users = await User.bulkCreate([
    { name: "Alice Admin", email: "admin@shipyard.dev", password: bcrypt.hashSync("admin123", 10), role: "admin" },
    { name: "Leo Lead",    email: "lead@shipyard.dev",  password: bcrypt.hashSync("lead123",  10), role: "lead"  },
    { name: "Dev Dana",    email: "dev@shipyard.dev",   password: bcrypt.hashSync("dev123",   10), role: "dev"   },
  ]);

  const lead = users.find(u => u.role === "lead");
  const dev  = users.find(u => u.role === "dev");

  await Project.bulkCreate([
    { name: "Alpha", description: "First project",  status: "active",   owner_id: lead.id },
    { name: "Beta",  description: "Second project", status: "inactive", owner_id: dev.id  },
  ]);

  console.log("✅ Seed complete");
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });