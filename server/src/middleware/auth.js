export const verifySensorSecret = (req, res, next) => {
  const secret = req.headers['x-sensor-secret'];
  const expected = process.env.SENSOR_API_SECRET;

  if (!expected) {
    return next();
  }

  if (!secret || secret !== expected) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid Sensor Credentials',
    });
  }

  next();
};
