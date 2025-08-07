# Collections File System

## Overview

The collections are now stored in a local JSON file (`src/assets/data/collections.json`) instead of browser localStorage. This allows you to commit and push collection changes to your repository.

## How It Works

1. **File Storage**: Collections are stored in `src/assets/data/collections.json`
2. **Temporary Storage**: Changes are also saved to localStorage for immediate use
3. **Export Function**: Use the "Export Collections" button to download updated collections

## Workflow

### Making Changes to Collections

1. Go to **Admin > Collection Management**
2. Make your desired changes (create, edit, delete collections)
3. Click the **"Export Collections"** button
4. A `collections.json` file will be downloaded
5. Replace the content of `src/assets/data/collections.json` with the downloaded file
6. Commit and push the changes to your repository

### File Structure

The collections file has this structure:

```json
{
  "collections": [
    {
      "id": "unique-id",
      "name": "Collection Name",
      "description": "Collection description",
      "logoIds": ["logo1", "logo2", "logo3"],
      "tags": ["tag1", "tag2"],
      "isPublic": true,
      "featured": false,
      "coverImage": "/assets/logos/example.png",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Benefits

- ✅ **Version Control**: Collections can be tracked in Git
- ✅ **Collaboration**: Multiple people can work on collections
- ✅ **Backup**: Collections are safely stored in the repository
- ✅ **Deployment**: Collections are included in production builds

## Fallback System

If the collections file cannot be loaded:
1. The system falls back to localStorage data
2. If no localStorage data exists, default collections are loaded
3. All changes are still saved to localStorage for immediate use

## Admin Access

- **Password**: `admin123`
- **Access**: Go to `/admin` route
- **Features**: Collection management and tag management 