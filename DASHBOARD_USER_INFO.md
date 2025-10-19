# Dashboard User Info Display

## Overview
Added a compact user information card on the Dashboard that displays the logged-in user's organization name and role.

## Visual Design

### Layout
```
┌─────────────────────────────────────────┐
│ Dashboard                               │
│ Welcome back, John Doe                  │
├─────────────────────────────────────────┤
│ ║                                       │
│ ║  ORGANIZATION  My PG Organization     │
│ ║                                       │
│ ║  ROLE  ┌──────────┐                  │
│ ║        │  ADMIN   │                  │
│ ║        └──────────┘                  │
└─────────────────────────────────────────┘
```

### Design Details

**Card Style:**
- White background
- Rounded corners (12px)
- Blue left border (4px) for accent
- Compact padding (12px)
- Positioned below header, above stats

**Organization Display:**
- Label: "ORGANIZATION" (11px, gray, bold)
- Value: Organization name (13px, dark, bold)
- Horizontal layout with spacing

**Role Display:**
- Label: "ROLE" (11px, gray, bold)
- Value: Badge with blue background (#EEF2FF)
- Role text in blue (12px, bold)
- Rounded badge (6px radius)
- Compact padding (8px horizontal, 2px vertical)

## Code Structure

### User Type Updates
```typescript
// front-end/src/types/index.ts
export interface User {
  s_no: number;
  name: string;
  email: string;
  phone?: string;
  role_id: number;
  role_name?: string;           // ← Added
  organization_id: number;
  organization_name?: string;   // ← Added
  status?: 'ACTIVE' | 'INACTIVE';
  // ... other fields
}
```

### Dashboard Implementation
```tsx
{/* User Info Card */}
{user && (
  <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
    <View style={{ 
      backgroundColor: 'white', 
      borderRadius: 12, 
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: Theme.colors.primary,
    }}>
      <View style={{ flex: 1 }}>
        {/* Organization */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, fontWeight: '600', marginRight: 8 }}>
            ORGANIZATION
          </Text>
          <Text style={{ fontSize: 13, color: Theme.colors.text.primary, fontWeight: '600' }}>
            {user.organization_name || 'N/A'}
          </Text>
        </View>
        
        {/* Role */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, fontWeight: '600', marginRight: 8 }}>
            ROLE
          </Text>
          <View style={{ 
            backgroundColor: '#EEF2FF', 
            paddingHorizontal: 8, 
            paddingVertical: 2, 
            borderRadius: 6 
          }}>
            <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '700' }}>
              {user.role_name || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  </View>
)}
```

## Styling Details

### Colors
- **Card Background**: White (`#FFFFFF`)
- **Left Border**: Primary blue (`Theme.colors.primary`)
- **Label Text**: Secondary gray (`Theme.colors.text.secondary`)
- **Organization Text**: Primary dark (`Theme.colors.text.primary`)
- **Role Badge Background**: Light blue (`#EEF2FF`)
- **Role Badge Text**: Primary blue (`Theme.colors.primary`)

### Typography
- **Labels**: 11px, bold (600)
- **Organization**: 13px, bold (600)
- **Role**: 12px, extra bold (700)

### Spacing
- **Card Padding**: 12px all sides
- **Border Width**: 4px left
- **Border Radius**: 12px
- **Bottom Margin**: 16px
- **Label Spacing**: 8px right margin
- **Row Spacing**: 4px between organization and role

### Dimensions
- **Full Width**: Responsive (with 16px horizontal padding)
- **Height**: Auto (based on content)
- **Badge Padding**: 8px horizontal, 2px vertical
- **Badge Radius**: 6px

## Data Source

The user data comes from the Redux auth state:

```typescript
const { user } = useSelector((state: RootState) => state.auth);
```

### Expected Data Structure
```typescript
{
  s_no: 1,
  name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  role_id: 1,
  role_name: "ADMIN",              // From API
  organization_id: 1,
  organization_name: "My PG Org",  // From API
  status: "ACTIVE"
}
```

## API Integration

The backend API (verify-otp endpoint) returns user data with organization and role information:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "s_no": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role_id": 1,
    "role_name": "ADMIN",
    "organization_id": 1,
    "organization_name": "My PG Organization",
    "status": "ACTIVE"
  },
  "access_token": "...",
  "refresh_token": "..."
}
```

## Responsive Behavior

### Mobile Portrait
- Full width with 16px padding
- Single row layout
- Compact text sizes

### Mobile Landscape
- Same layout maintained
- Scrollable with other content

### Tablet
- Same design scales proportionally
- May add more spacing if needed

## Fallback Handling

If organization or role data is missing:

```typescript
{user.organization_name || 'N/A'}
{user.role_name || 'N/A'}
```

Shows "N/A" instead of empty space.

## Position in Dashboard

```
┌─────────────────────────────────┐
│ ScreenHeader                    │
│ - Dashboard title               │
│ - Welcome back, {name}          │
├─────────────────────────────────┤
│ User Info Card ← NEW            │
│ - Organization                  │
│ - Role                          │
├─────────────────────────────────┤
│ Stats Cards                     │
│ - Active Tenants                │
│ - PG Locations                  │
│ - Total Revenue                 │
│ - Pending Payments              │
├─────────────────────────────────┤
│ Quick Actions                   │
│ - Tenants, Payments, Settings  │
└─────────────────────────────────┘
```

## Accessibility

- **High Contrast**: Labels in gray, values in dark
- **Clear Hierarchy**: Labels smaller than values
- **Visual Distinction**: Role badge stands out
- **Readable Fonts**: Bold weights for emphasis
- **Proper Spacing**: Easy to scan

## Performance

- **Conditional Rendering**: Only shows if user exists
- **No Extra API Calls**: Uses existing auth data
- **Lightweight**: Simple View components
- **No Images**: Text-only for fast rendering

## Future Enhancements

Possible improvements:

- [ ] Add user avatar/profile picture
- [ ] Make organization name clickable (view details)
- [ ] Add last login timestamp
- [ ] Show user status indicator (online/offline)
- [ ] Add quick profile edit button
- [ ] Show organization logo
- [ ] Add role permissions indicator
- [ ] Make it collapsible/expandable
- [ ] Add animation on mount
- [ ] Show multiple roles if applicable

## Testing Checklist

- [ ] Organization name displays correctly
- [ ] Role name displays correctly
- [ ] "N/A" shows when data missing
- [ ] Card renders on all screen sizes
- [ ] Colors match theme
- [ ] Text is readable
- [ ] Layout doesn't break with long names
- [ ] Spacing is consistent
- [ ] Badge styling is correct
- [ ] Left border shows properly

## Files Modified

1. **`front-end/src/types/index.ts`**
   - Added `role_name?: string`
   - Added `organization_name?: string`

2. **`front-end/src/screens/dashboard/DashboardScreen.tsx`**
   - Added User Info Card component
   - Positioned below header
   - Conditional rendering based on user data

## Example Screenshots

### With Data
```
┌─────────────────────────────────────┐
│ ║                                   │
│ ║  ORGANIZATION  Green Valley PG    │
│ ║                                   │
│ ║  ROLE  ┌──────────┐              │
│ ║        │  ADMIN   │              │
│ ║        └──────────┘              │
└─────────────────────────────────────┘
```

### Without Data
```
┌─────────────────────────────────────┐
│ ║                                   │
│ ║  ORGANIZATION  N/A                │
│ ║                                   │
│ ║  ROLE  ┌──────┐                  │
│ ║        │ N/A  │                  │
│ ║        └──────┘                  │
└─────────────────────────────────────┘
```

### Different Roles
```
ADMIN       → Blue badge
MANAGER     → Blue badge
EMPLOYEE    → Blue badge
OWNER       → Blue badge
```

All roles use the same styling for consistency.
