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