# 🔍 Floating Network Logger - User Guide

## What is it?
A **draggable floating button** that provides instant access to network logs anywhere in the app.

## Features

### 🎯 Always Accessible
- Visible on all screens
- Works even when app has errors
- Never blocks important UI elements

### 🖱️ Fully Draggable
- **Drag** the button to any position on screen
- **Stays** where you place it
- **Smooth** animation and movement

### 📊 Visual Indicators
- **Green button** with 🔍 icon
- **Red badge** shows number of network requests
- **Shadow** for better visibility

## How to Use

### Moving the Button
1. **Touch and hold** the 🔍 button
2. **Drag** it to your preferred position
3. **Release** - button stays in place

### Opening Network Logger
- **Single tap** on the button
- Logger modal opens with all network requests

### Clearing Logs
- **Long press** (hold for 2 seconds) on the button
- Confirmation alert appears
- All logs are cleared

## Button Actions

| Action | Result |
|--------|--------|
| **Tap** | Opens network logger modal |
| **Long Press** | Clears all network logs |
| **Drag** | Moves button to new position |

## Visual Guide

```
Initial Position:        After Dragging:
┌─────────────────┐     ┌─────────────────┐
│ 🔍              │     │                 │
│ (5)             │     │                 │
│                 │     │                 │
│                 │     │                 │
│                 │     │                 │
│                 │     │            🔍   │
│                 │     │            (5)  │
└─────────────────┘     └─────────────────┘
```

## Badge Indicator

The red badge shows the number of network requests:

- **No badge** = No requests logged
- **(5)** = 5 requests logged
- **(99+)** = 99 or more requests

## Best Practices

### 1. Position for Your Workflow
- **Top-right**: Easy thumb access
- **Bottom-right**: Out of the way
- **Top-left**: Default position
- **Bottom-left**: Alternative position

### 2. When to Use
- ✅ Debugging API issues
- ✅ Checking request/response data
- ✅ Monitoring network activity
- ✅ Troubleshooting errors

### 3. When to Clear Logs
- After debugging a specific issue
- When logs get too large (99+)
- Before testing a new feature
- To start fresh

## Technical Details

### Implementation
- Uses React Native's **PanResponder**
- **Animated.View** for smooth movement
- **Absolute positioning** with z-index
- **Persistent position** during session

### Performance
- Lightweight component
- No impact on app performance
- Efficient gesture handling
- Minimal re-renders

## Troubleshooting

### Button not dragging?
1. Make sure you're **touching the button itself** (not the badge)
2. Try **dragging slowly** at first
3. Check if logger modal is open (button hides when modal is visible)

### Button disappeared?
1. Close the network logger modal
2. Button should reappear
3. If not, restart the app

### Can't tap the button?
1. Make sure you're not in the middle of dragging
2. Try a **quick tap** instead of holding
3. Check if another modal is blocking it

### Button stuck in corner?
1. **Drag it out** to a better position
2. The button can be moved anywhere on screen
3. Position is saved during the session

## Keyboard Shortcuts

While the logger modal is open:

- **Swipe down** - Close modal
- **Scroll** - Navigate through logs
- **Tap log** - View details
- **Tap "Clear"** - Clear all logs

## Tips & Tricks

### 💡 Tip 1: Quick Access
Place the button in your **dominant hand's thumb zone** for fastest access.

### 💡 Tip 2: Badge Monitoring
Watch the badge number to see if requests are being made in real-time.

### 💡 Tip 3: Error Debugging
When an error occurs:
1. Tap the floating button immediately
2. Check the last few requests
3. Look for 4xx or 5xx status codes

### 💡 Tip 4: Long Press to Clear
Before testing a specific feature, **long press** to clear old logs so you only see relevant requests.

### 💡 Tip 5: Position Persistence
Your button position is remembered during the app session, so you only need to position it once.

## Comparison with Shake Gesture

| Feature | Floating Button | Shake Gesture |
|---------|----------------|---------------|
| Reliability | ✅ Always works | ⚠️ May fail |
| Accessibility | ✅ Visual | ❌ Hidden |
| Error scenarios | ✅ Works | ❌ May not work |
| Ease of use | ✅ One tap | ⚠️ Requires shake |
| Customization | ✅ Draggable | ❌ Fixed |

## Future Enhancements

Planned features:
- [ ] Save position preference
- [ ] Customize button size
- [ ] Change button color/icon
- [ ] Quick filters from button
- [ ] Mini preview on hover

---

**Enjoy debugging with the floating network logger!** 🔍✨
