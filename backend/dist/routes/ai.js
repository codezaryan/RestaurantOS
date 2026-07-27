"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiService_1 = require("../services/aiService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const aiService = new aiService_1.AIService();
// GET /api/ai/predict-shortages
router.get('/predict-shortages', auth_1.authenticateToken, async (req, res) => {
    try {
        const predictions = await aiService.predictIngredientShortages();
        return res.json(predictions);
    }
    catch (error) {
        console.error('AI Shortage Error:', error);
        return res.status(500).json({ error: 'Failed to predict shortages' });
    }
});
// GET /api/ai/recommend-reorder
router.get('/recommend-reorder', auth_1.authenticateToken, async (req, res) => {
    try {
        const recommendations = await aiService.recommendReorderQuantities();
        return res.json(recommendations);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to generate reorder recommendations' });
    }
});
// GET /api/ai/suggest-pricing
router.get('/suggest-pricing', auth_1.authenticateToken, async (req, res) => {
    try {
        const pricingSuggestions = await aiService.suggestMenuPricing();
        return res.json(pricingSuggestions);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to suggest menu pricing' });
    }
});
// POST /api/ai/estimate-prep-time
router.post('/estimate-prep-time', auth_1.authenticateToken, async (req, res) => {
    try {
        const { itemIds } = req.body;
        const estimate = await aiService.estimateFoodPrepTime(itemIds);
        return res.json(estimate);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to estimate food prep time' });
    }
});
// GET /api/ai/analyze-waste
router.get('/analyze-waste', auth_1.authenticateToken, async (req, res) => {
    try {
        const wasteAnalysis = await aiService.analyzeIngredientWaste();
        return res.json(wasteAnalysis);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to analyze waste' });
    }
});
exports.default = router;
