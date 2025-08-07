# Admin Access

## Accessing the Admin Panel

1. Navigate to `/admin` in the application
2. You will be redirected to `/admin-login` if not authenticated
3. Enter the admin password: `greekfootball2024`
4. Click "Login" to access the admin panel

## Admin Features

### Collection Management
- Create new collections
- Edit existing collections
- Delete collections
- Add/remove logos from collections
- Manage collection tags
- Set collection visibility (public/private)
- Mark collections as featured

### Tag Management
- Create new tags
- Edit existing tags
- Delete tags
- Manage tag assignments

## Security

- Admin session persists in localStorage
- Logout button available in admin panel
- Password protection on all admin routes
- Automatic redirect to login if not authenticated

## Password

**Current admin password:** `greekfootball2024`

You can change this password in `src/app/services/admin.service.ts` by modifying the `correctPassword` variable. 