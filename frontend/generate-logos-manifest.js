const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, 'src', 'assets', 'logos');
const outputFile = path.join(__dirname, 'src', 'assets', 'logos-manifest.json');

function scanLogos(dir, league = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      // Append subdirectory name to the league path
      const subLeague = league ? `${league}/${item.name}` : item.name;
      result.push(...scanLogos(fullPath, subLeague));
    } else if (item.isFile() && /\.(png|jpg|jpeg|svg|webp)$/i.test(item.name)) {
      const teamName = path.basename(item.name, path.extname(item.name))
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      result.push({
        name: teamName,
        path: `assets/logos/${league ? league + '/' : ''}${item.name}`,
        league: league || 'Other'
      });
    }
  }

  return result;
}

const logos = scanLogos(logosDir);
fs.writeFileSync(outputFile, JSON.stringify(logos, null, 2));
console.log(`Generated manifest with ${logos.length} logos at ${outputFile}`);

// Generate sitemap.xml with Image extensions
const sitemapFile = path.join(__dirname, 'src', 'sitemap.xml');
const baseUrl = 'https://greek-football-logos.site';
const currentDate = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
`;

logos.forEach(logo => {
  const safeTitle = logo.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  sitemapXml += `    <image:image>
      <image:loc>${baseUrl}/${encodeURI(logo.path)}</image:loc>
      <image:title>${safeTitle} Logo / Λογότυπο</image:title>
    </image:image>
`;
});

sitemapXml += `  </url>
  <url>
    <loc>${baseUrl}/misc</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/tag-manager</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/collections</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`;

fs.writeFileSync(sitemapFile, sitemapXml);
console.log(`Generated sitemap with ${logos.length} images at ${sitemapFile}`);
