# Reset Button Implementation Guide

## Overview
Added a "Reset Everything & Reload" button to the Settings panel that clears all localStorage data and reloads the page with factory defaults.

## Location
**Settings Panel** → Workspace Layouts section → Orange warning box at bottom

## What It Does

### Clears All Saved Data
- User authentication state
- Panel positions and sizes
- Layout preferences
- Settings and preferences
- User stats (XP, level, streak)
- Pages and blocks
- All persisted Zustand state

### Reloads Page
After clearing localStorage, the page automatically reloads with:
- Default Studio layout
- All panels in default positions
- Settings panel closed (not covering content)
- Fresh authentication state (will show login screen)

## User Interface

### Visual Design
```
┌─────────────────────────────────────────┐
│ ⚠️ Having visibility issues?            │
│ Clear all saved data and reset to       │
│ factory defaults                         │
│                                          │
│ [🔄 Reset Everything & Reload]          │
└─────────────────────────────────────────┐
```

### Colors
- Background: Orange-50 (`bg-orange-50`)
- Border: Orange-200 (`border-orange-200`)
- Text: Orange-900 (heading), Orange-700 (description)
- Button: Orange-600 with hover Orange-700
- Icon: Warning triangle (⚠️) and Rotate CCW (🔄)

### Confirmation Dialog
Before executing, shows browser confirmation:
```
This will clear all saved layouts, preferences, and reload the page. Continue?
[Cancel] [OK]
```

## Implementation Details

### Code Location
**File**: `components/Panels/SettingsPanel.tsx`

### Button Handler
```typescript
onClick={() => {
  if (confirm('This will clear all saved layouts, preferences, and reload the page. Continue?')) {
    localStorage.clear();
    window.location.reload();
  }
}}
```

### New Icons Added
**File**: `components/Icons.tsx`

1. **AlertTriangle** - Warning icon for the notice
2. **RotateCcw** - Rotate counter-clockwise icon for reset button

## When to Use

### User Should Click Reset When:
1. **Visibility Issues**
   - Only seeing language selector
   - Panels not visible
   - Sidebar not showing
   - Content covered by other panels

2. **Layout Problems**
   - Panels stuck off-screen
   - Can't access certain panels
   - Layout looks broken
   - Maximized panel won't minimize

3. **State Corruption**
   - App behaving strangely
   - Settings not saving
   - Panels not responding
   - Authentication issues

4. **After Updates**
   - New version deployed
   - Layout presets changed
   - Default states updated

## What Happens After Reset

### Immediate Effects
1. All localStorage cleared
2. Page reloads automatically
3. Shows login screen (user logged out)
4. All panels reset to default positions

### Default Layout (Studio)
After reset, user will see:
- **Sidebar**: Visible on left (desktop)
- **Planner Panel**: Open (top-left)
- **Search Panel**: Open (bottom-left)
- **Notes Panel**: Open (center)
- **Settings Panel**: Closed (not covering content)
- **Other Panels**: Closed by default

### User Must Re-do
- Login again
- Set API key (if configured)
- Adjust layout preferences
- Recreate any custom notes/pages

## Alternative Solutions

### Before Using Reset Button

1. **Try Layout Presets First**
   - Click Studio, Cinema, or Research buttons
   - These reset panel positions without clearing data

2. **Toggle Individual Panels**
   - Use sidebar icons to show/hide panels
   - Use Command Palette (Cmd+K / Ctrl+K)

3. **Hard Refresh Browser**
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R
   - May fix rendering issues without data loss

4. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors
   - May indicate specific issue

## Developer Notes

### Testing Reset Button
```javascript
// Manual test in browser console
localStorage.clear();
window.location.reload();
```

### Checking localStorage Size
```javascript
// See what's stored
console.log(localStorage);

// Check specific key
console.log(localStorage.getItem('mindhangar-storage'));
```

### Debugging Persisted State
```javascript
// Parse Zustand state
const state = JSON.parse(localStorage.getItem('mindhangar-storage'));
console.log('User:', state.state.user);
console.log('Panels:', state.state.activePanels);
console.log('Settings:', state.state.settings);
```

## Safety Features

### Confirmation Required
- User must click "OK" in confirmation dialog
- Prevents accidental resets
- Clear warning message

### No Data Loss Risk
- Only clears localStorage (local browser data)
- No server data affected
- No permanent data loss
- User can login again and continue

### Reversible
- User can login again immediately
- Backend services will reinitialize
- Progress tracking continues from server
- Only local preferences lost

## User Instructions

### How to Access
1. Click Settings icon in sidebar (gear icon)
2. Scroll down to "Workspace Layouts" section
3. Look for orange warning box
4. Click "Reset Everything & Reload" button
5. Confirm in dialog
6. Wait for page to reload
7. Login again

### What to Expect
- Page will reload automatically
- Login screen will appear
- All panels in default positions
- Clean slate to start fresh

## Troubleshooting

### Button Not Working
1. Check browser console for errors
2. Try hard refresh (Ctrl+Shift+R)
3. Manually clear localStorage:
   ```javascript
   localStorage.clear()
   ```
4. Close and reopen browser

### Still Having Issues After Reset
1. Clear browser cache
2. Try incognito/private window
3. Check for browser extensions interfering
4. Try different browser
5. Check network connection

## Related Documentation
- `FRONTEND_FIX_SUMMARY.md` - Visibility issue fixes
- `FRONTEND_UPDATE_SUMMARY.md` - All frontend updates
- `USER_BUG_REPORT.md` - Original bug reports
- `DEVELOPER_ACTION_PLAN.md` - Development roadmap

## Future Enhancements

### Potential Improvements
1. **Selective Reset**
   - Reset only layout (keep user data)
   - Reset only settings (keep layout)
   - Reset only authentication

2. **Export/Import Settings**
   - Save layout to file
   - Share layouts with others
   - Backup before reset

3. **Version Migration**
   - Auto-detect old state format
   - Migrate to new format
   - Preserve user data

4. **Reset History**
   - Track when resets occur
   - Show reset count
   - Suggest reset if issues detected

## Summary

The Reset Button provides a quick way for users to fix visibility and layout issues by clearing all localStorage and reloading with factory defaults. It's prominently placed in the Settings panel with clear warnings and confirmation to prevent accidental use.

**Key Benefits:**
- ✅ Fixes visibility issues instantly
- ✅ Clears corrupted state
- ✅ Restores default layout
- ✅ Safe and reversible
- ✅ Easy to access
- ✅ Clear user feedback

**Status**: ✅ Implemented and ready to use
