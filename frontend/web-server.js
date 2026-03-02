const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/greek-football-logos/browser')));

// Serve sitemap.xml with correct MIME type
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'dist/greek-football-logos/browser/sitemap.xml');
  
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

// Serve robots.txt with correct MIME type
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, 'dist/greek-football-logos/browser/robots.txt');
  
  if (fs.existsSync(robotsPath)) {
    res.setHeader('Content-Type', 'text/plain');
    res.sendFile(robotsPath);
  } else {
    res.status(404).send('Robots.txt not found');
  }
});

// Handle all other routes by serving the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/greek-football-logos/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on http://localhost:${PORT}`);
  console.log(`📄 Sitemap: http://localhost:${PORT}/sitemap.xml`);
  console.log(`🤖 Robots: http://localhost:${PORT}/robots.txt`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down web server...');
  process.exit(0);
}); 