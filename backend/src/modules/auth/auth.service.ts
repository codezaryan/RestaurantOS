import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../../middleware/auth";
import { authRepository } from "./auth.repository";

export const authService = {
  async login(dto: any) {
    await authRepository.testConnection();

    let user = await authRepository.findByEmail(dto.email);
    if (!user && dto.requestedRole) {
      user = await authRepository.findByRole(dto.requestedRole);
    }
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      // Log failed attempt
      await authRepository.createAuditLog({
        userId: user.id,
        userName: user.name,
        action: "LOGIN_FAILED",
        module: "AUTHENTICATION",
        details: `Failed login attempt for user ${user.name} (${user.email}) - invalid password`
      });
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    await authRepository.createAuditLog({
      userId: user.id,
      userName: user.name,
      action: "USER_LOGIN",
      module: "AUTHENTICATION",
      details: `User ${user.name} logged in with role ${user.role}`
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },

  async getUsers() {
    return authRepository.getUsers();
  },

  async createUser(data: any, currentUser?: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await authRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "WAITER",
      phone: data.phone
    });

    await authRepository.createAuditLog({
      userId: currentUser?.id,
      userName: currentUser?.name,
      action: "CREATE_STAFF",
      module: "STAFF_MANAGEMENT",
      details: `Created new staff member ${data.name} (${data.role})`
    });

    return user;
  },

  async seedDatabase() {
    const userCount = await authRepository.userCount();
    if (userCount > 0) {
      throw new Error("ALREADY_SEEDED");
    }

    const passwordHash = await bcrypt.hash("password123", 10);

    const users = await Promise.all([
      authRepository.createUser({ name: "Praveen Yadav", email: "owner@restaurantos.io", password: passwordHash, role: "OWNER", phone: "+1-555-0192" }),
      authRepository.createUser({ name: "Arun Kumar", email: "manager@restaurantos.io", password: passwordHash, role: "MANAGER", phone: "+1-555-0193" }),
      authRepository.createUser({ name: "Chef Bharath", email: "chef@restaurantos.io", password: passwordHash, role: "CHEF", phone: "+1-555-0194" }),
      authRepository.createUser({ name: "Alex Rivers", email: "waiter@restaurantos.io", password: passwordHash, role: "WAITER", phone: "+1-555-0195" }),
      authRepository.createUser({ name: "Sarah Connor", email: "cashier@restaurantos.io", password: passwordHash, role: "CASHIER", phone: "+1-555-0196" }),
      authRepository.createUser({ name: "David Miller", email: "store@restaurantos.io", password: passwordHash, role: "STORE_MANAGER", phone: "+1-555-0197" }),
    ]);

    return {
      message: "Database seeded successfully",
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
      loginHint: "Use any email above with password: password123"
    };
  }
};
