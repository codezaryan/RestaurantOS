import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const aiService = new AIService();

// GET /api/ai/predict-shortages
router.get('/predict-shortages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const predictions = await aiService.predictIngredientShortages();
    return res.json(predictions);
  } catch (error) {
    console.error('AI Shortage Error:', error);
    return res.status(500).json({ error: 'Failed to predict shortages' });
  }
});

// GET /api/ai/recommend-reorder
router.get('/recommend-reorder', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const recommendations = await aiService.recommendReorderQuantities();
    return res.json(recommendations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate reorder recommendations' });
  }
});

// GET /api/ai/suggest-pricing
router.get('/suggest-pricing', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const pricingSuggestions = await aiService.suggestMenuPricing();
    return res.json(pricingSuggestions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to suggest menu pricing' });
  }
});

// POST /api/ai/estimate-prep-time
router.post('/estimate-prep-time', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { itemIds } = req.body;
    const estimate = await aiService.estimateFoodPrepTime(itemIds);
    return res.json(estimate);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to estimate food prep time' });
  }
});

// GET /api/ai/analyze-waste
router.get('/analyze-waste', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const wasteAnalysis = await aiService.analyzeIngredientWaste();
    return res.json(wasteAnalysis);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze waste' });
  }
});

export default router;
