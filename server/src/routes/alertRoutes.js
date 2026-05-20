import { Router } from 'express';
import { getAlerts, acknowledgeAlert, getUnreadCount } from '../controllers/alertController.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const acknowledged = req.query.acknowledged !== undefined ? req.query.acknowledged === 'true' : null;
    const alerts = await getAlerts(limit, acknowledged);
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const count = await getUnreadCount();
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await acknowledgeAlert(req.params.id, req.body.by || 'user');
    if (!alert) return res.status(404).json({ success: false, error: 'Alerta no encontrada' });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
