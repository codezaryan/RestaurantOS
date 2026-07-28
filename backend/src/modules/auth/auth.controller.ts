import { Request, Response } from "express";

import { authService } from "./auth.service";
import { validateLogin } from "./auth.validation";

export const login = async (
    req: Request,
    res: Response
) => {

    const error = validateLogin(
        req.body.email,
        req.body.password
    );

    if (error) {
        return res.status(400).json({
            error
        });
    }

    try {

        const result = await authService.login(req.body);

        return res.json(result);

    } catch {

        return res.status(401).json({
            error: "Invalid email or password."
        });

    }

};