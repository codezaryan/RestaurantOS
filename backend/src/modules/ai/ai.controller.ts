import { Request, Response } from "express";
import { aiService } from "./ai.service";

export const predictShortages = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await aiService.predictShortages();
        return res.json(result);
    } catch (error) {
        console.error("AI Shortage Error:", error);

        return res.status(500).json({
            error: "Failed to predict shortages"
        });
    }
};

export const recommendReorder = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await aiService.recommendReorder();

        return res.json(result);
    } catch {
        return res.status(500).json({
            error: "Failed to generate reorder recommendations"
        });
    }
};

export const suggestPricing = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await aiService.suggestPricing();

        return res.json(result);
    } catch {
        return res.status(500).json({
            error: "Failed to suggest menu pricing"
        });
    }
};

export const estimatePrepTime = async (
    req: Request,
    res: Response
) => {
    try {
        const { itemIds = [] } = req.body;

        const result = await aiService.estimatePrepTime(itemIds);

        return res.json(result);
    } catch {
        return res.status(500).json({
            error: "Failed to estimate food prep time"
        });
    }
};

export const analyzeWaste = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await aiService.analyzeWaste();

        return res.json(result);
    } catch {
        return res.status(500).json({
            error: "Failed to analyze waste"
        });
    }
};