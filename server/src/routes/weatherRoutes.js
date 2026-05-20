import { Router } from 'express';
import { getForecast, fetchAndStoreForecast, getCurrentPrecipitationProb } from '../controllers/weatherController.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const forecast = await getForecast();
    res.json({ success: true, data: forecast });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const forecast = await fetchAndStoreForecast();
    res.json({ success: true, data: forecast });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/precipitation-prob', async (req, res) => {
  try {
    const prob = await getCurrentPrecipitationProb();
    res.json({ success: true, data: { precipitation_prob: prob } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
