# SearchableDropdown Component - Usage Guide ✅

## Overview
The `SearchableDropdown` component is a reusable, searchable dropdown with modal interface already used in PGLocationsScreen. This guide shows how to replace custom dropdowns in AddTenantScreen.

---

## 🎯 **Component Features**

- ✅ **Searchable** - Filter items by typing
- ✅ **Modal interface** - Full-screen selection
- ✅ **Loading state** - Shows spinner while fetching
- ✅ **Error handling** - Display validation errors
- ✅ **Required field** - Asterisk indicator
- ✅ **Disabled state** - Gray out when not available
- ✅ **Animated** - Smooth transitions
- ✅ **Empty state** - "No results found" message

---

## 📋 **Component API**

```typescript
interface SearchableDropdownProps {
  label: string;                    // Field label
  placeholder: string;              // Placeholder text
  items: DropdownItem[];           // Array of items
  selectedValue: number | null;    // Selected item ID
  onSelect: (item: DropdownItem) => void;  // Selection callback
  loading?: boolean;               // Show loading spinner
  disabled?: boolean;              // Disable dropdown
  error?: string;                  // Error message
  required?: boolean;              // Show asterisk (*)
}

interface DropdownItem {
  id: number;      // Unique identifier
  label: string;   // Display text
  value: any;      // Any additional value
}
```

---

## 🔄 **Migration Guide**

### **Step 1: Update Form State**

**Before:**
```typescript
const [formData, setFormData] = useState({
  state_id: '',
  state_label: '',
  city_id: '',
  city_label: '',
  room_id: '',
  room_label: '',
  bed_id: '',
  bed_label: '',
});
```

**After:**
```typescript
const [formData, setFormData] = useState({
  state_id: null as number | null,
  city_id: null as number | null,
  room_id: null as number | null,
  bed_id: null as number | null,
});
```

### **Step 2: Update Data Storage**

**Before:**
```typescript
const [statesList, setStatesList] = useState<OptionType[]>([]);
const [citiesList, setCitiesList] = useState<OptionType[]>([]);
```

**After:**
```typescript
const [stateData, setStateData] = useState<StateData[]>([]);
const [cityData, setCityData] = useState<CityData[]>([]);
```

### **Step 3: Update Fetch Functions**

**Before:**
```typescript
const fetchStates = async () => {
  const response = await axiosInstance.get('/location/states');
  const states = response.data.data;
  setStatesList(
    states.map((state: StateData) => ({
      label: state.name,
      value: state.s_no.toString(),
    }))
  );
};
```

**After:**
```typescript
const fetchStates = async () => {
  const response = await axiosInstance.get('/location/states', {
    params: { countryCode: 'IN' },
  });
  if (response.data.success) {
    setStateData(response.data.data);
  }
};
```

### **Step 4: Replace Custom Dropdown with SearchableDropdown**

**Before (Custom Dropdown):**
```typescript
<View style={{ marginBottom: 16, zIndex: 2000 }}>
  <Text>State</Text>
  <TouchableOpacity onPress={() => setShowStateDropdown(!showStateDropdown)}>
    <Text>{formData.state_label || 'Select state'}</Text>
    <Text>{showStateDropdown ? '▲' : '▼'}</Text>
  </TouchableOpacity>
  {showStateDropdown && (
    <View style={{ position: 'absolute' }}>
      <ScrollView>
        {statesList.map((state) => (
          <TouchableOpacity
            onPress={() => {
              setFormData(prev => ({ 
                ...prev, 
                state_id: state.value, 
                state_label: state.label 
              }));
              setShowStateDropdown(false);
            }}
          >
            <Text>{state.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )}
</View>
```

**After (SearchableDropdown):**
```typescript
<SearchableDropdown
  label="State"
  placeholder="Select a state"
  items={stateData.map(state => ({
    id: state.s_no,
    label: state.name,
    value: state.iso_code,
  }))}
  selectedValue={formData.state_id}
  onSelect={(item) => setFormData(prev => ({ ...prev, state_id: item.id }))}
  loading={loadingStates}
  required={false}
/>
```

---

## 📝 **Complete Examples**

### **Example 1: State Dropdown**

```typescript
<SearchableDropdown
  label="State"
  placeholder="Select a state"
  items={stateData.map(state => ({
    id: state.s_no,
    label: state.name,
    value: state.iso_code,
  }))}
  selectedValue={formData.state_id}
  onSelect={(item) => {
    setFormData(prev => ({ ...prev, state_id: item.id }));
    // Trigger city fetch
    const selectedState = stateData.find(s => s.s_no === item.id);
    if (selectedState) {
      fetchCities(selectedState.iso_code);
    }
  }}
  loading={loadingStates}
  required={false}
/>
```

### **Example 2: City Dropdown (Dependent)**

```typescript
<SearchableDropdown
  label="City"
  placeholder="Select a city"
  items={cityData.map(city => ({
    id: city.s_no,
    label: city.name,
    value: city.s_no,
  }))}
  selectedValue={formData.city_id}
  onSelect={(item) => setFormData(prev => ({ ...prev, city_id: item.id }))}
  loading={loadingCities}
  disabled={!formData.state_id}  // Disabled until state selected
  required={false}
/>
```

### **Example 3: Room Dropdown (Required)**

```typescript
<SearchableDropdown
  label="Room"
  placeholder="Select a room"
  items={roomList.map(room => ({
    id: parseInt(room.value),
    label: room.label,
    value: room.value,
  }))}
  selectedValue={formData.room_id}
  onSelect={(item) => setFormData(prev => ({ ...prev, room_id: item.id }))}
  loading={loadingRooms}
  error={errors.room_id}
  required={true}
/>
```

### **Example 4: Bed Dropdown (Dependent & Required)**

```typescript
<SearchableDropdown
  label="Bed"
  placeholder="Select a bed"
  items={bedsList.map(bed => ({
    id: parseInt(bed.value),
    label: bed.label,
    value: bed.value,
  }))}
  selectedValue={formData.bed_id}
  onSelect={(item) => setFormData(prev => ({ ...prev, bed_id: item.id }))}
  loading={loadingBeds}
  disabled={!formData.room_id}  // Disabled until room selected
  error={errors.bed_id}
  required={true}
/>
```

---

## 🎨 **UI Comparison**

### **Custom Dropdown:**
```
┌─────────────────────────────────┐
│ State                           │
│ ┌─────────────────────────────┐ │
│ │ Select state            ▼   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │  ← Inline list
│ │ Karnataka                   │ │
│ │ Maharashtra                 │ │
│ │ Tamil Nadu                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### **SearchableDropdown:**
```
┌─────────────────────────────────┐
│ State                           │
│ ┌─────────────────────────────┐ │
│ │ Karnataka               ▼   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
        ↓ (Tap opens modal)
┌─────────────────────────────────┐
│ State                       ✕   │
├─────────────────────────────────┤
│ 🔍 Search state...              │
├─────────────────────────────────┤
│ Karnataka                   ✓   │  ← Full screen modal
│ Maharashtra                     │
│ Tamil Nadu                      │
│ ...                             │
└─────────────────────────────────┘
```

---

## ✅ **Benefits**

### **1. Better UX:**
- Full-screen modal (easier to see all options)
- Search functionality (find items quickly)
- Smooth animations
- Clear visual feedback

### **2. Less Code:**
- No custom dropdown state management
- No z-index issues
- No position calculations
- Built-in loading/error states

### **3. Consistent:**
- Same component across app
- Same behavior everywhere
- Easier to maintain

### **4. Accessible:**
- Keyboard navigation
- Screen reader support
- Touch-friendly targets

---

## 🔧 **Implementation Checklist**

- [ ] Import SearchableDropdown component
- [ ] Update form state (remove `_label` fields)
- [ ] Update data storage (store full objects)
- [ ] Update fetch functions (store raw data)
- [ ] Replace State dropdown
- [ ] Replace City dropdown
- [ ] Replace Room dropdown
- [ ] Replace Bed dropdown
- [ ] Remove custom dropdown state variables
- [ ] Test all dropdowns
- [ ] Test cascading selections
- [ ] Test validation

---

## 📦 **Files to Update**

1. **AddTenantScreen.tsx**
   - Import SearchableDropdown
   - Update state management
   - Replace all custom dropdowns

2. **No new files needed**
   - SearchableDropdown already exists
   - Already used in PGLocationsScreen

---

## 🎉 **Result**

After migration:
- ✅ Cleaner code (less lines)
- ✅ Better UX (searchable modal)
- ✅ Consistent UI (same as PG Locations)
- ✅ Easier maintenance
- ✅ No z-index issues
- ✅ Built-in features (search, loading, errors)

**Use SearchableDropdown for all dropdown selections!** 🎯✨
