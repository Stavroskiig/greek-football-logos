const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to the team-tags.json file
const TEAM_TAGS_FILE = path.join(__dirname, 'src', 'assets', 'data', 'team-tags.json');

// API endpoint to save team tags
app.post('/api/team-tags', async (req, res) => {
  try {
    const teamTags = req.body;
    
    // Ensure the directory exists
    const dir = path.dirname(TEAM_TAGS_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    // Write the team tags to the file
    await fs.writeFile(TEAM_TAGS_FILE, JSON.stringify(teamTags, null, 2), 'utf8');
    
    console.log(`✅ Team tags saved to: ${TEAM_TAGS_FILE}`);
    res.json({ success: true, message: 'Team tags saved successfully' });
  } catch (error) {
    console.error('❌ Error saving team tags:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get current team tags
app.get('/api/team-tags', async (req, res) => {
  try {
    const data = await fs.readFile(TEAM_TAGS_FILE, 'utf8');
    const teamTags = JSON.parse(data);
    res.json(teamTags);
  } catch (error) {
    console.error('❌ Error reading team tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Team tags server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Team tags server running on http://localhost:${PORT}`);
  console.log(`📁 Team tags file: ${TEAM_TAGS_FILE}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
}); 