# Admin Panel Access Guide

## How to Access Admin Panel

### Method 1: Direct URL Access
Navigate to: `/secret-admin-portal`

**Default Admin Password:** `admin123456`

### Method 2: From Expo Go
1. Open the app in Expo Go
2. Navigate to: `exp://[your-ip]:8081/--/secret-admin-portal`
3. Enter the admin password

### Method 3: From Web Browser
1. Open: `http://localhost:8081/secret-admin-portal`
2. Enter the admin password

## Admin Panel Features

Once logged in, you'll have access to:

- **Dashboard**: Overview of app statistics
- **User Management**: View and manage all users
- **Pricing Control**: Update exchange rates
- **Promotions**: Create and manage promotional offers
- **Analytics**: View detailed reports and statistics
- **Support**: Manage support tickets
- **Subscriptions**: Review premium subscription requests
- **Payment Methods**: Manage payment options
- **Settings**: Configure app settings and change admin password

## Security Notes

1. **Change Default Password**: After first login, go to Settings and change the admin password
2. **Keep Password Secure**: Never share admin credentials
3. **Access Control**: The admin panel is hidden from regular users
4. **Session Management**: You'll be automatically logged out after closing the app

## Troubleshooting

### "login is not a function" Error
This error has been fixed. The `login` function is now properly aliased to `loginUser`.

### Cannot Access Admin Panel
1. Make sure you're using the correct URL: `/secret-admin-portal`
2. Clear app cache and restart
3. Check that you're entering the correct password

### Password Not Working
1. Default password is: `admin123456`
2. If you changed it and forgot, you'll need to clear app storage
3. On web: Clear localStorage
4. On mobile: Uninstall and reinstall the app

## For Developers

The admin panel is implemented using:
- **Route**: `app/secret-admin-portal.tsx`
- **Store**: `hooks/admin-store.tsx`
- **Dashboard**: `app/admin/dashboard.tsx`

All admin routes are protected and require authentication.
