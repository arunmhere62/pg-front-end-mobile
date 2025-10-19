# PG Locations Screen Documentation

## Overview
A complete CRUD (Create, Read, Update, Delete) screen for managing PG locations in the mobile app.

---

## Features

### ✨ Full CRUD Operations
- **Create** - Add new PG locations with modal form
- **Read** - View all PG locations in a list
- **Update** - Edit existing PG locations
- **Delete** - Remove PG locations with confirmation

### 🎨 Beautiful UI
- **Card-based List** - Each PG location displayed in a clean card
- **Modal Forms** - Slide-up modal for create/edit operations
- **Floating Action Button** - Quick access to add new PG
- **Status Badges** - Visual indicators for ACTIVE/INACTIVE status
- **Empty State** - Helpful message when no locations exist

### 🔍 Smart Features
- **Pull to Refresh** - Swipe down to reload data
- **Loading States** - Spinners for all async operations
- **Validation** - Form validation before submission
- **Searchable Dropdowns** - State and city selection with search
- **Confirmation Dialogs** - Confirm before deleting

---

## Screen Layout

```
┌─────────────────────────────────────┐
│ PG Locations                        │
│ Manage your PG locations            │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Green Valley PG            ✏️ 🗑️│ │
│ │ 123 Main Street, Bangalore      │ │
│ │ 📍 Bangalore, Karnataka • 560001│ │
│ │ ┌────────┐                      │ │
│ │ │ ACTIVE │                      │ │
│ │ └────────┘                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Sunrise PG                 ✏️ 🗑️│ │
│ │ 456 Park Road, Mumbai           │ │
│ │ 📍 Mumbai, Maharashtra • 400001 │ │
│ │ ┌──────────┐                    │ │
│ │ │ INACTIVE │                    │ │
│ │ └──────────┘                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│                                  ┌──┐
│                                  │+ │
│                                  └──┘
└─────────────────────────────────────┘
```

---

## Components

### PG Location Card
Each card displays:
- **Location Name** (18px, bold)
- **Address** (14px, gray)
- **City, State, Pincode** (12px, gray, with 📍 icon)
- **Status Badge** (ACTIVE = green, INACTIVE = red)
- **Edit Button** (✏️ emoji, blue background)
- **Delete Button** (🗑️ emoji, red background)

### Floating Action Button
- **Position**: Bottom right (20px from edge, 90px from bottom)
- **Size**: 60x60px circle
- **Color**: Primary blue
- **Icon**: + symbol (32px, white)
- **Shadow**: Elevated with shadow

### Modal Form
- **Animation**: Slide up from bottom
- **Background**: Semi-transparent overlay
- **Content**: White card with rounded top corners
- **Max Height**: 90% of screen
- **Scrollable**: Yes

---

## Form Fields

### Create/Edit Form
1. **PG Location Name*** (required)
   - Text input
   - Placeholder: "Enter PG location name"

2. **Address*** (required)
   - Multiline text input (3 lines)
   - Placeholder: "Enter complete address"

3. **State*** (required)
   - Searchable dropdown
   - Loads from API
   - Triggers city loading

4. **City*** (required)
   - Searchable dropdown
   - Loads based on selected state
   - Only shown after state selection

5. **Pincode** (optional)
   - Numeric input
   - Placeholder: "Enter pincode"

---

## API Integration

### Endpoints Used

1. **Get All PG Locations**
   ```
   GET /api/v1/pg-locations
   ```

2. **Create PG Location**
   ```
   POST /api/v1/pg-locations
   ```

3. **Update PG Location**
   ```
   PUT /api/v1/pg-locations/:id
   ```

4. **Delete PG Location**
   ```
   DELETE /api/v1/pg-locations/:id
   ```

5. **Get States**
   ```
   GET /api/v1/location/states?countryCode=IN
   ```

6. **Get Cities**
   ```
   GET /api/v1/location/cities?stateCode={code}
   ```

---

## User Flow

### View PG Locations
1. User opens Dashboard
2. Taps "PG Locations" quick action
3. Screen loads and displays all PG locations
4. Pull down to refresh

### Create New PG Location
1. Tap floating + button
2. Modal slides up with empty form
3. Fill in location name
4. Fill in address
5. Select state (cities load automatically)
6. Select city
7. Optionally enter pincode
8. Tap "Create" button
9. Success message shown
10. Modal closes
11. List refreshes with new location

### Edit PG Location
1. Tap ✏️ button on a card
2. Modal slides up with pre-filled form
3. Modify desired fields
4. Tap "Update" button
5. Success message shown
6. Modal closes
7. List refreshes with updated data

### Delete PG Location
1. Tap 🗑️ button on a card
2. Confirmation dialog appears
3. User confirms deletion
4. Success message shown
5. List refreshes without deleted location

---

## State Management

### Component State
```typescript
const [pgLocations, setPgLocations] = useState<PGLocation[]>([]);
const [loading, setLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [modalVisible, setModalVisible] = useState(false);
const [editMode, setEditMode] = useState(false);
const [selectedPG, setSelectedPG] = useState<PGLocation | null>(null);
const [formData, setFormData] = useState<FormData>({...});
const [states, setStates] = useState<State[]>([]);
const [cities, setCities] = useState<City[]>([]);
const [loadingStates, setLoadingStates] = useState(false);
const [loadingCities, setLoadingCities] = useState(false);
const [submitting, setSubmitting] = useState(false);
```

---

## Validation

### Form Validation Rules
- **Location Name**: Required, not empty
- **Address**: Required, not empty
- **State**: Required, must be selected
- **City**: Required, must be selected
- **Pincode**: Optional, no validation

### Error Messages
- "Please enter PG location name"
- "Please enter address"
- "Please select a state"
- "Please select a city"

---

## Styling

### Colors
- **Card Background**: White
- **Active Badge**: Green background (#D1FAE5), green text (#059669)
- **Inactive Badge**: Red background (#FEE2E2), red text (#DC2626)
- **Edit Button**: Light blue (#EEF2FF)
- **Delete Button**: Light red (#FEE2E2)
- **FAB**: Primary blue
- **Modal Overlay**: Black 50% opacity

### Typography
- **Location Name**: 18px, bold
- **Address**: 14px, secondary color
- **City/State**: 12px, secondary color
- **Status Badge**: 11px, bold
- **Modal Title**: 20px, bold
- **Form Labels**: 12px, secondary color

### Spacing
- **Card Margin**: 16px bottom
- **Card Padding**: Default from Card component
- **Modal Padding**: 20px
- **Form Field Margin**: 16px bottom
- **Button Gap**: 12px

---

## Empty State

When no PG locations exist:
```
┌─────────────────────────────────────┐
│                                     │
│              🏢                     │
│                                     │
│      No PG Locations Yet            │
│                                     │
│  Add your first PG location to     │
│         get started                 │
│                                     │
└─────────────────────────────────────┘
```

---

## Loading States

### Initial Load
- Shows spinner with "Loading PG locations..." text
- Centered on screen

### Pull to Refresh
- Native RefreshControl component
- Appears at top when pulling down

### Form Submission
- Submit button shows ActivityIndicator
- Button disabled during submission

### Dropdown Loading
- SearchableDropdown shows spinner
- Dropdown disabled during loading

---

## Error Handling

### API Errors
```typescript
try {
  // API call
} catch (error: any) {
  const errorMessage = error.response?.data?.message || 'Default message';
  Alert.alert('Error', errorMessage);
}
```

### Common Errors
- Network errors
- Validation errors from backend
- Not found errors (404)
- Server errors (500)

---

## Navigation

### Access Points
1. **Dashboard** → Quick Actions → "PG Locations"
2. Direct navigation: `navigation.navigate('PGLocations')`

### Navigation Stack
```
MainTabs (Tab Navigator)
  ├─ Dashboard
  ├─ Tenants
  ├─ Payments
  └─ Settings

PGLocations (Stack Screen)
```

---

## Responsive Design

### Mobile Portrait
- Full width cards
- 2-column quick actions on Dashboard
- Modal takes 90% height

### Mobile Landscape
- Same layout
- Scrollable content

### Tablet
- Same design scales proportionally
- May benefit from wider cards

---

## Accessibility

- **Touch Targets**: Minimum 44x44px
- **Contrast**: High contrast text
- **Feedback**: Visual feedback on all interactions
- **Error Messages**: Clear and descriptive
- **Loading States**: Visible indicators

---

## Performance Optimizations

1. **Lazy Loading**: States loaded on mount, cities on demand
2. **Conditional Rendering**: City dropdown only when state selected
3. **Memoization**: Could add useMemo for filtered data
4. **Debouncing**: SearchableDropdown handles search efficiently
5. **Pull to Refresh**: Only reloads when user initiates

---

## Files Created/Modified

### Created
1. **`front-end/src/screens/pg-locations/PGLocationsScreen.tsx`**
   - Complete CRUD screen component

### Modified
1. **`front-end/src/navigation/AppNavigator.tsx`**
   - Added PGLocationsScreen import
   - Added PGLocations stack screen

2. **`front-end/src/screens/dashboard/DashboardScreen.tsx`**
   - Added "PG Locations" to quick actions menu

---

## Dependencies

- `axios` - HTTP client
- `react-native` - Core components
- `SearchableDropdown` - Custom dropdown component
- `ScreenLayout` - Layout wrapper
- `ScreenHeader` - Header component
- `Card` - Card component
- Theme system

---

## Future Enhancements

- [ ] Add image upload for PG locations
- [ ] Add filtering (by status, city, state)
- [ ] Add sorting options
- [ ] Add search functionality
- [ ] Add pagination for large lists
- [ ] Add bulk operations
- [ ] Add map view of locations
- [ ] Add location details screen
- [ ] Add photo gallery
- [ ] Add amenities list
- [ ] Add room count display
- [ ] Add tenant count per location

---

## Testing Checklist

- [ ] Load PG locations on screen open
- [ ] Pull to refresh works
- [ ] Create new PG location
- [ ] Edit existing PG location
- [ ] Delete PG location with confirmation
- [ ] Form validation works
- [ ] State/city dropdowns work
- [ ] Modal opens and closes
- [ ] Empty state displays correctly
- [ ] Loading states show properly
- [ ] Error messages display
- [ ] Navigation works from Dashboard
- [ ] FAB button works
- [ ] Edit/Delete buttons work
- [ ] Status badges display correctly

---

## Known Issues

None currently.

---

## Support

For issues or questions, check:
- API documentation: `api/PG_LOCATION_API.md`
- SearchableDropdown docs: `front-end/SEARCHABLE_DROPDOWN.md`
