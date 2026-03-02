# Team Tags File Management Setup

This system allows UI changes to directly affect the `src/assets/data/team-tags.json` file.

## 🚀 Quick Setup

### 1. Install Server Dependencies
```bash
# Copy the server package.json
cp package-server.json package-server.json.backup

# Install server dependencies
npm install express cors
npm install --save-dev nodemon
```

### 2. Start the Backend Server
```bash
# Start the server (in a separate terminal)
node server.js
```

You should see:
```
🚀 Team tags server running on http://localhost:3000
📁 Team tags file: C:\Users\stavr\Documents\GitHub\greek-football-logos\src\assets\data\team-tags.json
```

### 3. Start Your Angular App
```bash
# In another terminal
ng serve
```

## 🔧 How It Works

### File Structure
```
greek-football-logos/
├── server.js                    ← Backend server
├── package-server.json          ← Server dependencies
├── src/
│   ├── assets/
│   │   └── data/
│   │       └── team-tags.json  ← Target file (will be updated by UI)
│   └── app/
│       ├── services/
│       │   ├── tag-storage.service.ts
│       │   └── file-save.service.ts
│       └── components/
│           └── file-manager/
│               └── file-manager.component.ts
```

### API Endpoints
- `POST /api/team-tags` - Save team tags to file
- `GET /api/team-tags` - Get current team tags
- `GET /api/health` - Server health check

## 🎯 Usage

### Batched File Updates
When you make changes in the UI (add/remove tags from teams), the system will:
1. **Accumulate changes** in memory (no immediate save)
2. **Show pending changes** in a floating panel
3. **Save when you click "Save Changes"** - then updates localStorage and sends to server
4. **Server writes changes** to `src/assets/data/team-tags.json`

### Manual File Management
Use the File Manager component to:
- **Download Team Tags File**: Get current team tags as JSON
- **Copy to Clipboard**: Copy team tags for manual file replacement
- **Export All Tag Data**: Export complete tag data

### Server Status
The File Manager shows server status:
- 🟢 **Server Running**: Backend is active and ready
- 🔴 **Server Not Running**: Backend is not available (fallback to download)

## 🔄 Development Workflow

1. **Start the server**: `node server.js`
2. **Start Angular app**: `ng serve`
3. **Make UI changes**: Add/remove tags in the application (changes are batched)
4. **Review changes**: Check the floating "Save Changes" panel
5. **Save changes**: Click "Save Changes" to commit to file
6. **Verify changes**: Check `src/assets/data/team-tags.json` for updates

## 🛠️ Troubleshooting

### Server Not Starting
```bash
# Check if port 3000 is available
netstat -an | findstr :3000

# Kill process if needed
taskkill /F /PID <PID>
```

### File Not Updating
1. Check server console for errors
2. Verify file path: `src/assets/data/team-tags.json`
3. Check browser console for API errors
4. Use the "Copy to Clipboard" button for manual replacement

### CORS Issues
The server includes CORS middleware, but if you have issues:
```javascript
// In server.js, update CORS settings
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

## 📝 Notes

- The server runs on `localhost:3000`
- The Angular app runs on `localhost:4200`
- File changes are logged in the server console
- If the server is down, changes will fallback to file download
- The system maintains both localStorage and file storage for redundancy

## 🎉 Success Indicators

✅ Server running on port 3000  
✅ File Manager shows "Server Running"  
✅ UI changes appear in `team-tags.json`  
✅ Console shows "Team tags saved successfully" 