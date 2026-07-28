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
            throw new Error("INVALID_CREDENTIALS");
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return {
            token,
            user
        };
    }

};