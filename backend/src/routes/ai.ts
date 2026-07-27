import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';
import axios from 'axios';

const router = Router();
const aiService = new AIService();
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Helper to call FastAPI with fallback to local AIService
async function callFastAPI(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  try {
    const url = `${FASTAPI_URL}${endpoint}`;
    const config: any = { timeout: 15000 };
    if (body) config.data = body;
    const response = method === 'GET' 
      ? await axios.get(url, config)
      : await axios.post(url, body, config);
    return response.data;
  } catch (error) {
    console.warn(`FastAPI service unreachable at ${FASTAPI_URL}${endpoint}, falling back to local AIService`);
    return null;
  }
}

// GET /api/ai/predict-shortages
router.get('/predict-shortages', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const fastAPIData = await callFastAPI('/ai/predict-shortages');
    if (fastAPIData) return res.json(fastAPIData);

    const predictions = await aiService.predictIngredientShortages();
    return res.json(predictions);
  } catch (error) {
    console.error('AI Shortage Error:', error);
    return res.status(500).json({ error: 'Failed to predict shortages' });
  }
});

// GET /api/ai/recommend-reorder
router.get('/recommend-reorder', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const fastAPIData = await callFastAPI('/ai/recommend-reorder');
    if (fastAPIData) return res.json(fastAPIData);

    const recommendations = await aiService.recommendReorderQuantities();
    return res.json(recommendations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate reorder recommendations' });
  }
});

// GET /api/ai/suggest-pricing
router.get('/suggest-pricing', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const fastAPIData = await callFastAPI('/ai/suggest-pricing');
    if (fastAPIData) return res.json(fastAPIData);

    const pricingSuggestions = await aiService.suggestMenuPricing();
    return res.json(pricingSuggestions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to suggest menu pricing' });
  }
});

// POST /api/ai/estimate-prep-time
router.post('/estimate-prep-time', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF'), async (req: AuthRequest, res: Response) => {
  try {
    const { itemIds } = req.body;
    const fastAPIData = await callFastAPI('/ai/estimate-prep-time', 'POST', { itemIds });
    if (fastAPIData) return res.json(fastAPIData);

    const estimate = await aiService.estimateFoodPrepTime(itemIds || []);
    return res.json(estimate);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to estimate food prep time' });
  }
});

// GET /api/ai/analyze-waste
router.get('/analyze-waste', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF'), async (req: AuthRequest, res: Response) => {
  try {
    const fastAPIData = await callFastAPI('/ai/analyze-waste');
    if (fastAPIData) return res.json(fastAPIData);

    const wasteAnalysis = await aiService.analyzeIngredientWaste();
    return res.json(wasteAnalysis);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze waste' });
  }
});

export default router;
