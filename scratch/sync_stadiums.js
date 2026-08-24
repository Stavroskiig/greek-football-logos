const fs = require('fs');

async function main() {
    const locationsRaw = fs.readFileSync('./frontend/src/assets/data/team-locations.json', 'utf8');
    const locations = JSON.parse(locationsRaw);
    const locationMap = new Map();
    for (const loc of locations) {
        locationMap.set(loc.id, loc);
        // Also map by name just in case
        locationMap.set(loc.name, loc);
    }

    console.log('Fetching all teams...');
    const res = await fetch('https://greek-football-logos-backend.onrender.com/api/teams?size=3000');
    const data = await res.json();
    const teams = data.content;

    console.log(`Fetched ${teams.length} teams.`);
    let updated = 0;

    for (const team of teams) {
        let loc = locationMap.get(team.id);
        if (!loc) {
            loc = locationMap.get(team.name);
        }

        if (loc) {
            if (!team.stadium || !team.stadium.latitude) {
                team.stadium = {
                    ...team.stadium,
                    name: team.name + ' Stadium',
                    latitude: loc.lat,
                    longitude: loc.lng,
                    region: loc.region,
                    capacity: 0,
                    location: ''
                };

                const updateRes = await fetch(`https://greek-football-logos-backend.onrender.com/api/teams/${encodeURIComponent(team.id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(team)
                });

                if (updateRes.ok) {
                    updated++;
                    console.log(`Updated stadium for ${team.name}`);
                } else {
                    console.error(`Failed to update ${team.name}:`, await updateRes.text());
                }
            }
        }
    }

    console.log(`Done. Updated ${updated} teams.`);
}

main().catch(console.error);
