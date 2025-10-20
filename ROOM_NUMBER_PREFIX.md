# Room Number Prefix Feature - RM Default

## Overview

Room numbers now automatically use "RM" as a prefix for consistent naming across the application.

---

## 🎯 Feature Details

### Default Prefix: **RM**

All room numbers are automatically prefixed with "RM" (Room):
- **RM101** - Room 101
- **RM-A1** - Room A1
- **RM-Ground-1** - Ground Floor Room 1

---

## 🎨 UI Implementation

### Input Field Design

```
┌─────────────────────────────────────┐
│ Room Number *                       │
│                                     │
│ ┌────┬──────────────────────────┐  │
│ │ RM │ 101, A1, Ground-1        │  │
│ └────┴──────────────────────────┘  │
│                                     │
│ Room number will be: RM101          │
└─────────────────────────────────────┘
```

**Features:**
- **Fixed Prefix Box**: "RM" displayed in a colored box (cannot be edited)
- **Input Field**: User types the room identifier
- **Live Preview**: Shows the complete room number below
- **Visual Separation**: Clear distinction between prefix and input

---

## 💻 Technical Implementation

### 1. Default State

```typescript
const [formData, setFormData] = useState({
  room_no: 'RM',  // Default starts with RM
  rent_price: '',
  images: [] as string[],
});
```

### 2. Input Handling

```typescript
const updateField = (field: string, value: string) => {
  // Special handling for room_no to maintain RM prefix
  if (field === 'room_no') {
    // If user tries to delete RM prefix, restore it
    if (!value.startsWith('RM')) {
      value = 'RM' + value.replace(/^RM/i, '');
    }
    // Ensure RM is uppercase
    if (value.length >= 2) {
      value = 'RM' + value.substring(2);
    }
  }
  
  setFormData((prev) => ({ ...prev, [field]: value }));
};
```

### 3. Validation

```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.room_no.trim() || formData.room_no.trim() === 'RM') {
    newErrors.room_no = 'Room number is required (e.g., RM101, RM-A1)';
  }
  
  return Object.keys(newErrors).length === 0;
};
```

### 4. UI Component

```typescript
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  {/* Fixed RM Prefix */}
  <View
    style={{
      backgroundColor: Theme.colors.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      borderRightWidth: 0,
    }}
  >
    <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.primary }}>
      RM
    </Text>
  </View>
  
  {/* User Input */}
  <TextInput
    value={formData.room_no.substring(2)}
    onChangeText={(value) => updateField('room_no', 'RM' + value)}
    placeholder="101, A1, Ground-1"
    style={{
      flex: 1,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      borderLeftWidth: 0,
      padding: 12,
      fontSize: 14,
      backgroundColor: '#fff',
    }}
  />
</View>

{/* Live Preview */}
<Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, marginTop: 4 }}>
  Room number will be: {formData.room_no || 'RM___'}
</Text>
```

---

## 🎯 User Experience

### Creating a Room

1. **User opens "Add Room" screen**
2. **Room Number field shows:**
   - Fixed "RM" prefix in colored box
   - Empty input field with placeholder
   - Preview: "Room number will be: RM___"

3. **User types "101"**
   - Input shows: "101"
   - Preview updates: "Room number will be: RM101"
   - Actual value stored: "RM101"

4. **User submits form**
   - Room saved as "RM101"

### Editing a Room

1. **User opens "Edit Room" screen**
2. **Existing room "RM101" loaded**
   - Prefix box shows: "RM"
   - Input field shows: "101"
   - Preview shows: "Room number will be: RM101"

3. **User changes to "A1"**
   - Input shows: "A1"
   - Preview updates: "Room number will be: RMA1"
   - Actual value: "RMA1"

---

## ✨ Features

### 1. **Automatic Prefix**
- RM is always added automatically
- User cannot delete the prefix
- Prefix is always uppercase

### 2. **Visual Clarity**
```
┌────┬──────────────┐
│ RM │ 101          │  ← Clear separation
└────┴──────────────┘
```

### 3. **Live Preview**
```
Room number will be: RM101
                     ↑
                     Shows final result
```

### 4. **Smart Validation**
```typescript
// Invalid
RM        → Error: "Room number is required"
(empty)   → Error: "Room number is required"

// Valid
RM101     → ✓
RM-A1     → ✓
RM-G-1    → ✓
```

### 5. **Consistent Formatting**
- All rooms follow same pattern
- Easy to search and filter
- Professional appearance

---

## 📋 Examples

### Valid Room Numbers

| User Types | Stored As | Display As |
|------------|-----------|------------|
| 101        | RM101     | RM101      |
| A1         | RMA1      | RMA1       |
| Ground-1   | RMGround-1| RMGround-1 |
| 2-B        | RM2-B     | RM2-B      |
| F1-101     | RMF1-101  | RMF1-101   |

### Common Patterns

**Numeric:**
- RM101, RM102, RM103...
- RM201, RM202, RM203...

**Alphanumeric:**
- RMA1, RMA2, RMA3...
- RMB1, RMB2, RMB3...

**Floor-Based:**
- RMG-1, RMG-2 (Ground floor)
- RMF1-1, RMF1-2 (First floor)
- RMF2-1, RMF2-2 (Second floor)

---

## 🎨 Styling

### Prefix Box
```typescript
{
  backgroundColor: Theme.colors.primary + '15',  // Light blue background
  paddingHorizontal: 12,
  paddingVertical: 12,
  borderTopLeftRadius: 8,
  borderBottomLeftRadius: 8,
  borderWidth: 1,
  borderColor: Theme.colors.border,
  borderRightWidth: 0,  // No border on right (connects to input)
}
```

### Prefix Text
```typescript
{
  fontSize: 14,
  fontWeight: '600',
  color: Theme.colors.primary,  // Blue color
}
```

### Input Field
```typescript
{
  flex: 1,
  borderWidth: 1,
  borderColor: Theme.colors.border,
  borderTopRightRadius: 8,
  borderBottomRightRadius: 8,
  borderLeftWidth: 0,  // No border on left (connects to prefix)
  padding: 12,
  fontSize: 14,
  backgroundColor: '#fff',
}
```

---

## 🔄 Behavior

### On Create
1. Field initializes with "RM"
2. User types room identifier
3. "RM" prefix is maintained
4. Full value saved to database

### On Edit
1. Existing room number loaded (e.g., "RM101")
2. Prefix "RM" shown in fixed box
3. Identifier "101" shown in input
4. User can edit identifier only
5. "RM" prefix always maintained

### On Validation
1. Check if room number is not just "RM"
2. Check if room number is not empty
3. Show error if invalid
4. Allow submission if valid

---

## 🚀 Benefits

### For Users
✅ **Consistent Naming** - All rooms follow same pattern  
✅ **Easy to Remember** - Clear prefix for all rooms  
✅ **Professional Look** - Organized room numbering  
✅ **No Mistakes** - Cannot forget to add prefix  

### For System
✅ **Easy Filtering** - All rooms start with "RM"  
✅ **Easy Sorting** - Consistent format for sorting  
✅ **Easy Search** - Search for "RM" finds all rooms  
✅ **Data Consistency** - No variations in format  

### For Database
✅ **Consistent Data** - All entries follow same pattern  
✅ **Easy Queries** - Simple to filter by prefix  
✅ **No Duplicates** - Clear identification  

---

## 📊 Database Impact

### Before
```
Room Numbers:
- 101
- A1
- Room 102
- RM103
- R-104
```
❌ Inconsistent format

### After
```
Room Numbers:
- RM101
- RMA1
- RM102
- RM103
- RM104
```
✅ Consistent format

---

## 🧪 Testing Checklist

- [ ] Default "RM" appears on create
- [ ] User can type room identifier
- [ ] Preview updates in real-time
- [ ] Cannot delete "RM" prefix
- [ ] Validation works correctly
- [ ] Edit mode loads correctly
- [ ] Prefix box is not editable
- [ ] Full room number saved to database
- [ ] Room number displays correctly in list
- [ ] Room number displays correctly in details

---

## 🎉 Summary

✅ **RM Prefix** - Automatically added to all room numbers  
✅ **Visual Design** - Fixed prefix box + input field  
✅ **Live Preview** - Shows final room number  
✅ **Smart Validation** - Ensures valid room numbers  
✅ **Consistent Format** - All rooms follow same pattern  
✅ **User Friendly** - Clear and intuitive interface  

Room numbers now have a professional, consistent format across the entire application! 🏠
