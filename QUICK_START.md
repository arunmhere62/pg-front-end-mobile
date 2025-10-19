# Quick Start Guide - PG Management Mobile App

## Issues Fixed

1. ✅ Changed `main` entry point from `expo-router` to `index.js`
2. ✅ Removed `expo-router` dependency (not needed)
3. ✅ Fixed `App.tsx` import paths (removed alias, using relative paths)
4. ✅ Updated `tsconfig.json` with proper compiler options
5. ✅ Created `metro.config.js` for Metro bundler
6. ✅ Created `app.d.ts` and `nativewind-env.d.ts` for NativeWind types
7. ✅ Removed missing asset file references from `app.json`
8. ✅ Fixed ScrollView `contentContainerClassName` to `contentContainerStyle`

## Known TypeScript Errors

The TypeScript errors you're seeing about `className` not existing on React Native components are expected because:

1. **NativeWind needs to be properly initialized** - The `className` prop is added by NativeWind at runtime
2. **TypeScript doesn't recognize it yet** - Need to restart TypeScript server

## Steps to Fix

### 1. Stop any running processes
Close the Metro bundler if it's running (Ctrl+C in the terminal)

### 2. Clear all caches
```bash
cd d:\pg-mobile-app\front-end

# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rmdir /s /q node_modules
npm install

# Clear Expo cache
npx expo start -c
```

### 3. Restart TypeScript Server in VS Code
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

### 4. Start the app
```bash
npm start
```

## Alternative: Use Inline Styles Instead of className

If NativeWind continues to cause issues, you can quickly convert to inline styles. Here's an example:

**Before (with className):**
```tsx
<View className="flex-1 bg-light p-4">
  <Text className="text-2xl font-bold text-dark">Hello</Text>
</View>
```

**After (with inline styles):**
```tsx
<View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 16 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>Hello</Text>
</View>
```

## Color Reference (from tailwind.config.js)

- `primary`: #3B82F6
- `secondary`: #10B981
- `danger`: #EF4444
- `warning`: #F59E0B
- `dark`: #1F2937
- `light`: #F9FAFB

## Testing the App

Once the app starts:

1. **Login Screen** - Enter a 10-digit phone number
2. **OTP Screen** - Enter the OTP sent to your phone
3. **Dashboard** - View stats and navigate to different sections

## Backend API

Make sure your NestJS backend is running:
```bash
cd d:\pg-mobile-app\api
npm run start:dev
```

The API should be accessible at `http://localhost:3000/api`

## Troubleshooting

### "className does not exist" errors
- These are TypeScript errors, not runtime errors
- The app should still work if you run it
- To fix: Restart TS server or convert to inline styles

### "Module not found" errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Metro bundler issues
- Run `npx expo start -c` to clear cache
- Close all terminals and restart

### Network errors
- Check if backend API is running
- Update `.env` file with correct API URL
- For physical devices, use your computer's IP instead of localhost

## Next Steps

1. Test the authentication flow
2. Add more screens as needed
3. Customize the UI/styling
4. Add error handling and validation
5. Implement remaining features (Rooms, Expenses, Visitors, etc.)

## Support

If you continue to face issues:
1. Share the exact error message
2. Check the Metro bundler console for runtime errors
3. Verify all dependencies are installed correctly
