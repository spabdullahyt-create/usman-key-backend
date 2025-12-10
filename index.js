const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const uri = "mongodb+srv://usmanathar009_db_user:rsHFV8FdgstM7wyF@usman-key-cluster.zgspjho.mongodb.net/apk_hub?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let keysCollection;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("apk_hub");
    keysCollection = db.collection("keys");
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Verify key
app.get('/verify', async (req, res) => {
  const key = req.query.key;
  if (!key) return res.json({ valid: false });

  try {
    const keyDoc = await keysCollection.findOne({ key });
    if (!keyDoc) return res.json({ valid: false });
    if (keyDoc.used) return res.json({ valid: false });

    // Mark key as used
    await keysCollection.updateOne({ key }, { $set: { used: true } });
    return res.json({ valid: true });
  } catch (err) {
    console.error(err);
    return res.json({ valid: false });
  }
});

// Generate new key (for admin/owner usage)
app.post('/generate', async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Key is required" });

  try {
    await keysCollection.insertOne({ key, used: false });
    return res.json({ success: true, key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save key" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));