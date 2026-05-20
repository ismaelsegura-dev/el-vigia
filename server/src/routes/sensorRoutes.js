import { Router } from 'express';
import { getAllSensors, getSensorById, getSensorHistory, getSensorReadings, insertReading } from '../controllers/sensorController.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sensors = await getAllSensors();
    res.json({ success: true, data: sensors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sensor = await getSensorById(req.params.id);
    if (!sensor) return res.status(404).json({ success: false, error: 'Sensor no encontrado' });
    res.json({ success: true, data: sensor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const history = await getSensorHistory(req.params.id, hours);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/readings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const readings = await getSensorReadings(req.params.id, limit);
    res.json({ success: true, data: readings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/reading', async (req, res) => {
  try {
    const { sensor_id, level, humidity, battery, temperature, signal_strength } = req.body;
    if (!sensor_id || level === undefined) {
      return res.status(400).json({ success: false, error: 'sensor_id y level son obligatorios' });
    }
    const reading = await insertReading({ sensor_id, level, humidity, battery, temperature, signal_strength, raw_payload: req.body });
    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
