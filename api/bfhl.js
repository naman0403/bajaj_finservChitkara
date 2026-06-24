'use strict';
const { payload } = require('../server');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST /bfhl.' });
  if (!req.body || !Array.isArray(req.body.data)) return res.status(400).json({ error: 'Request body must contain a data array.' });
  if (req.body.data.length > 50) return res.status(400).json({ error: 'Maximum 50 entries allowed.' });
  return res.status(200).json(payload(req.body.data));
};
