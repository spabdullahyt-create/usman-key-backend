const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> console.log("MongoDB connected"))
.catch(err=> console.log("MongoDB error:", err));

// --- Key Schema ---
const keySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  appId: { type: String, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Key = mongoose.models.Key || mongoose.model('Key', keySchema);

// --- Generate a new key (for admin) ---
app.post('/generate-key', async (req, res) => {
  const { appId } = req.body;
  const key = Math.random().toString(36).substring(2,10).toUpperCase(); // random key
  const newKey = new Key({ key, appId });
  await newKey.save();
  res.json({ key });
});

// --- Verify Key ---
app.post('/verify-key', async (req, res) => {
  const { key, appId } = req.body;
  const record = await Key.findOne({ key, appId });
  if(!record) return res.json({ valid: false, message: 'Key not found' });
  if(record.used) return res.json({ valid: false, message: 'Key already used' });

  record.used = true;
  await record.save();
  res.json({ valid: true, message: 'Key valid', apk_link: 'https://your-apk-link.com/app.apk' });
});

// --- Export for Vercel ---
module.exports = app;
module.exports = { config: { api: { bodyParser: true } } };
