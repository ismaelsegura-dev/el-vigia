import { Router } from 'express';
import { getDashboardKPIs, getSensorStatusSummary, getRecentReadings } from '../controllers/dashboardController.js';
import { getOptimalRoute, calculateScores } from '../controllers/routeController.js';
import { getCurrentPrecipitationProb } from '../controllers/weatherController.js';

const router = Router();

router.get('/kpis', async (req, res) => {
  try {
    const kpis = await getDashboardKPIs();
    res.json({ success: true, data: kpis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/status-summary', async (req, res) => {
  try {
    const summary = await getSensorStatusSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const readings = await getRecentReadings(hours);
    res.json({ success: true, data: readings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/scores', async (req, res) => {
  try {
    const precipProb = req.query.precipitation_prob
      ? parseInt(req.query.precipitation_prob)
      : await getCurrentPrecipitationProb();
    const scores = await calculateScores(precipProb);
    res.json({ success: true, data: scores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/route', async (req, res) => {
  try {
    const precipProb = req.body.precipitation_prob
      ? parseInt(req.body.precipitation_prob)
      : await getCurrentPrecipitationProb();
    const maxStops = parseInt(req.body.max_stops) || 20;
    const route = await getOptimalRoute(precipProb, maxStops);
    if (!route) return res.json({ success: true, data: null, message: 'No hay sensores criticos que requieran limpieza' });
    res.json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
