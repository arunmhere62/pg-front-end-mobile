# SearchableDropdown Component Documentation

## Overview
A beautiful, reusable dropdown component with search functionality, smooth animations, and modern UI design.

## Features

### 🎨 Beautiful UI
- **Modern Design**: Rounded corners, smooth shadows, and clean layout
- **Smooth Animations**: Spring animation for modal opening, fade for closing
- **Visual Feedback**: Selected items highlighted with checkmark
- **Responsive**: Adapts to different screen sizes

### 🔍 Search Functionality
- **Real-time Search**: Filters items as you type
- **Case Insensitive**: Searches regardless of letter case
- **Clear Button**: Quick clear search with ✕ button
- **Empty State**: Shows helpful message when no results found

### ⚡ Performance
- **Optimized Rendering**: Uses FlatList for efficient list rendering
- **Keyboard Handling**: Proper keyboard persistence
- **Loading States**: Shows spinner while data is loading
- **Disabled State**: Visual feedback for disabled dropdowns

### ✅ Validation
- **Required Field**: Shows asterisk (*) for required fields
- **Error Display**: Red border and error message for validation errors
- **Visual States**: Different styles for normal, error, and disabled states

## Props

```typescript
interface SearchableDropdownProps {
  label: string;              // Label text above dropdown
  placeholder: string;        // Placeholder text when nothing selected
  items: DropdownItem[];      // Array of items to display
  selectedValue: number | null; // Currently selected item ID
  onSelect: (item: DropdownItem) => void; // Callback when item selected
  loading?: boolean;          // Show loading spinner
  disabled?: boolean;         // Disable dropdown interaction
  error?: string;             // Error message to display
  required?: boolean;         // Show required asterisk
}

interface DropdownItem {
  id: number;      // Unique identifier
  label: string;   // Display text
  value: any;      // Additional value (optional)
}
```

## Usage

### Basic Usage

```tsx
import { SearchableDropdown } from '../../components/SearchableDropdown';

<SearchableDropdown
  label="State"
  placeholder="Select a state"
  items={[
    { id: 1, label: 'Karnataka', value: 'KA' },
    { id: 2, label: 'Maharashtra', value: 'MH' },
    { id: 3, label: 'Tamil Nadu', value: 'TN' },
  ]}
  selectedValue={selectedStateId}
  onSelect={(item) => setSelectedStateId(item.id)}
/>
```

### With Required Field

```tsx
<SearchableDropdown
  label="City"
  placeholder="Select a city"
  items={cities}
  selectedValue={selectedCityId}
  onSelect={(item) => handleCitySelect(item)}
  required
/>
```

### With Loading State

```tsx
<SearchableDropdown
  label="State"
  placeholder="Select a state"
  items={states}
  selectedValue={stateId}
  onSelect={handleStateSelect}
  loading={isLoadingStates}
/>
```

### With Error

```tsx
<SearchableDropdown
  label="City"
  placeholder="Select a city"
  items={cities}
  selectedValue={cityId}
  onSelect={handleCitySelect}
  error="Please select a city"
  required
/>
```

### With Disabled State

```tsx
<SearchableDropdown
  label="City"
  placeholder="Select a city"
  items={cities}
  selectedValue={cityId}
  onSelect={handleCitySelect}
  disabled={!stateId} // Disabled until state is selected
/>
```

## Complete Example (Signup Form)

```tsx
const [states, setStates] = useState<State[]>([]);
const [cities, setCities] = useState<City[]>([]);
const [stateId, setStateId] = useState<number | null>(null);
const [cityId, setCityId] = useState<number | null>(null);
const [loadingStates, setLoadingStates] = useState(false);
const [loadingCities, setLoadingCities] = useState(false);

const handleStateChange = (stateId: number) => {
  const selectedState = states.find(s => s.s_no === stateId);
  if (selectedState) {
    setStateId(stateId);
    setCityId(null); // Reset city
    fetchCities(selectedState.iso_code);
  }
};

return (
  <View>
    {/* State Dropdown */}
    <SearchableDropdown
      label="State"
      placeholder="Select a state"
      items={states.map(state => ({
        id: state.s_no,
        label: state.name,
        value: state.iso_code,
      }))}
      selectedValue={stateId}
      onSelect={(item) => handleStateChange(item.id)}
      loading={loadingStates}
      required
    />

    {/* City Dropdown (conditional) */}
    {stateId && (
      <SearchableDropdown
        label="City"
        placeholder="Select a city"
        items={cities.map(city => ({
          id: city.s_no,
          label: city.name,
          value: city.s_no,
        }))}
        selectedValue={cityId}
        onSelect={(item) => setCityId(item.id)}
        loading={loadingCities}
        required
      />
    )}
  </View>
);
```

## UI Elements

### Dropdown Button
- **Height**: 52px minimum
- **Border**: 2px solid #E5E7EB (error: #EF4444)
- **Border Radius**: 12px
- **Background**: White (disabled: #F9FAFB)
- **Icon**: Down arrow (▼)

### Modal
- **Overlay**: Semi-transparent black (50% opacity)
- **Content**: White with rounded corners (20px)
- **Shadow**: Elevated with shadow
- **Max Height**: 80% of screen
- **Animation**: Spring effect on open, fade on close

### Search Bar
- **Background**: Light gray (#F9FAFB)
- **Border**: 2px solid #E5E7EB
- **Border Radius**: 12px
- **Icon**: 🔍 emoji
- **Clear Button**: Small circular button with ✕

### List Items
- **Height**: Auto with 16px padding
- **Border**: Bottom border between items
- **Selected**: Light blue background (#EEF2FF)
- **Checkmark**: ✓ for selected item
- **Hover**: 70% opacity on press

### Empty State
- **Icon**: None (can be added)
- **Text**: "No results found"
- **Subtext**: "Try adjusting your search"
- **Padding**: 40px

## Styling Customization

The component uses the Theme system for consistent styling:

```typescript
import { Theme } from '../theme';

// Primary color for selected items
Theme.colors.primary

// Text colors
Theme.colors.text.primary
Theme.colors.text.secondary

// Error color
'#EF4444'

// Border colors
'#E5E7EB' // Normal
'#F3F4F6' // Light
```

## Animations

### Modal Opening
```typescript
Animated.spring(scaleAnim, {
  toValue: 1,
  useNativeDriver: true,
  tension: 50,
  friction: 7,
}).start();
```

### Modal Closing
```typescript
Animated.timing(scaleAnim, {
  toValue: 0,
  duration: 200,
  useNativeDriver: true,
}).start();
```

## Accessibility

- **Keyboard Handling**: `keyboardShouldPersistTaps="handled"`
- **Touch Feedback**: `activeOpacity={0.7}`
- **Modal Dismissal**: Tap outside to close
- **Clear Visual States**: Loading, disabled, error states

## Performance Tips

1. **Memoize Items**: Use `useMemo` for item transformation
   ```tsx
   const dropdownItems = useMemo(
     () => states.map(state => ({
       id: state.s_no,
       label: state.name,
       value: state.iso_code,
     })),
     [states]
   );
   ```

2. **Debounce Search**: For large datasets, debounce search input
3. **Virtualization**: FlatList handles virtualization automatically
4. **Avoid Re-renders**: Use `React.memo` for list items if needed

## Common Patterns

### Cascading Dropdowns
```tsx
// State changes trigger city load
const handleStateChange = (stateId: number) => {
  setStateId(stateId);
  setCityId(null); // Reset dependent dropdown
  loadCities(stateId);
};
```

### Validation
```tsx
const [stateError, setStateError] = useState('');

const validateState = () => {
  if (!stateId) {
    setStateError('Please select a state');
    return false;
  }
  setStateError('');
  return true;
};

<SearchableDropdown
  error={stateError}
  // ... other props
/>
```

### Dynamic Loading
```tsx
useEffect(() => {
  if (countryCode) {
    setLoadingStates(true);
    fetchStates(countryCode)
      .then(data => setStates(data))
      .finally(() => setLoadingStates(false));
  }
}, [countryCode]);
```

## Browser/Device Support

- ✅ iOS
- ✅ Android
- ✅ Web (React Native Web)
- ✅ All screen sizes
- ✅ Light/Dark mode compatible (with theme updates)

## Known Limitations

1. **Single Selection Only**: Currently supports only single selection
2. **No Grouping**: Items cannot be grouped into categories
3. **Fixed Height Modal**: Modal has fixed max height (80%)
4. **No Custom Rendering**: Item rendering is fixed (text + checkmark)

## Future Enhancements

- [ ] Multi-select support
- [ ] Custom item renderer
- [ ] Group/section support
- [ ] Virtual keyboard handling improvements
- [ ] Accessibility labels (screen readers)
- [ ] Custom animations
- [ ] Infinite scroll for large datasets
- [ ] Debounced search option
- [ ] Custom empty state component
- [ ] Keyboard navigation (arrow keys)

## Troubleshooting

### Modal doesn't open
- Check if `disabled` or `loading` props are set
- Verify items array is not empty

### Search not working
- Ensure items have `label` property
- Check if search is case-sensitive (it shouldn't be)

### Selected item not showing
- Verify `selectedValue` matches an item's `id`
- Check if items array contains the selected item

### Styling issues
- Ensure Theme is properly imported
- Check for conflicting styles in parent components
- Verify SafeAreaView is not interfering

## Support

For issues or feature requests, please check the component source code at:
`front-end/src/components/SearchableDropdown.tsx`
