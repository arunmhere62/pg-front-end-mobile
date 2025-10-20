# Bed Management with Bottom Sheet Modal ✅

## Overview

Implemented a beautiful bottom sheet modal for adding and editing beds that slides up from the bottom instead of navigating to a new screen.

---

## 📁 Files Created

### 1. **`src/services/bedService.ts`**
Complete bed API service with all CRUD operations:
- `getAllBeds()` - Get all beds with filters
- `getBedsByRoomId()` - Get beds for a specific room
- `getBedById()` - Get single bed details
- `createBed()` - Create new bed
- `updateBed()` - Update existing bed
- `deleteBed()` - Delete bed

### 2. **`src/components/BedFormModal.tsx`**
Beautiful bottom sheet modal component for bed creation/editing:
- Slides up from bottom with smooth animation
- Form validation
- Image upload support
- BD prefix for bed numbers
- Create and Edit modes

---

## 🎨 Bottom Sheet Modal Design

### Visual Layout

```
┌─────────────────────────────────┐
│  ━━━━                           │  Handle bar
│                                 │
│  ✏️ Edit Bed            ✕      │  Header
│  Room RM101                     │
├─────────────────────────────────┤
│                                 │
│  Bed Number *                   │
│  ┌────┬──────────────────┐     │
│  │ BD │ 1                │     │  BD prefix
│  └────┴──────────────────┘     │
│  Bed number will be: BD1        │
│                                 │
│  Bed Images (Optional)          │
│  [Image Upload Component]       │
│                                 │
├─────────────────────────────────┤
│  [Cancel]      [Create]         │  Footer buttons
└─────────────────────────────────┘
```

### Features

✅ **Smooth Animation** - Slides up/down with spring animation  
✅ **Backdrop Overlay** - Semi-transparent black background  
✅ **Handle Bar** - Visual indicator for draggable sheet  
✅ **Close Button** - X button in header  
✅ **BD Prefix** - Automatic "BD" prefix for bed numbers  
✅ **Live Preview** - Shows final bed number  
✅ **Image Upload** - Up to 3 bed images  
✅ **Validation** - Form validation with error messages  
✅ **Loading States** - Activity indicators during submission  
✅ **Keyboard Aware** - Adjusts for keyboard on mobile  

---

## 🔧 Implementation Details

### Bottom Sheet Animation

```typescript
const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

// Slide up
Animated.spring(slideAnim, {
  toValue: 0,
  useNativeDriver: true,
  tension: 65,
  friction: 11,
}).start();

// Slide down
Animated.timing(slideAnim, {
  toValue: SCREEN_HEIGHT,
  duration: 250,
  useNativeDriver: true,
}).start();
```

### BD Prefix Logic

```typescript
const updateField = (field: string, value: string) => {
  if (field === 'bed_no') {
    // Maintain BD prefix
    if (!value.startsWith('BD')) {
      value = 'BD' + value.replace(/^BD/i, '');
    }
    if (value.length >= 2) {
      value = 'BD' + value.substring(2);
    }
  }
  setFormData((prev) => ({ ...prev, [field]: value }));
};
```

### Form Validation

```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.bed_no.trim() || formData.bed_no.trim() === 'BD') {
    newErrors.bed_no = 'Bed number is required (e.g., BD1, BD-A)';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

## 📱 Room Details Screen Integration

### Bed List Display

```typescript
{beds && beds.length > 0 ? (
  <View style={{ gap: 8 }}>
    {beds.map((bed) => (
      <View key={bed.s_no}>
        <Text>{bed.bed_no}</Text>
        <Text>{bed.is_occupied ? '🔴 Occupied' : '🟢 Available'}</Text>
        <TouchableOpacity onPress={() => handleEditBed(bed)}>
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBed(bed.s_no, bed.bed_no)}>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
) : (
  <View>
    <Text>No beds added yet. Tap "Add Bed" to create one.</Text>
  </View>
)}
```

### Modal Integration

```typescript
<BedFormModal
  visible={bedModalVisible}
  onClose={() => setBedModalVisible(false)}
  onSuccess={handleBedFormSuccess}
  roomId={room?.s_no || roomId}
  roomNo={room?.room_no || ''}
  bed={selectedBed}
  pgId={selectedPGLocationId || undefined}
  organizationId={user?.organization_id}
  userId={user?.s_no}
/>
```

---

## 🎯 User Flow

### Adding a Bed

1. **User opens Room Details screen**
2. **User taps "Add Bed" button**
3. **Bottom sheet slides up from bottom**
4. **User enters bed number (BD prefix auto-added)**
5. **User optionally uploads images**
6. **User taps "Create" button**
7. **Bed is created**
8. **Modal slides down**
9. **Bed list refreshes**

### Editing a Bed

1. **User taps "Edit" on a bed**
2. **Bottom sheet slides up with bed data**
3. **User modifies bed number or images**
4. **User taps "Update" button**
5. **Bed is updated**
6. **Modal slides down**
7. **Bed list refreshes**

### Deleting a Bed

1. **User taps "Delete" on a bed**
2. **Confirmation alert appears**
3. **User confirms deletion**
4. **Bed is deleted**
5. **Bed list refreshes**

---

## 🎨 Styling

### Modal Container

```typescript
{
  backgroundColor: '#fff',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: SCREEN_HEIGHT * 0.9,
  ...Theme.colors.shadows.large,
}
```

### Handle Bar

```typescript
{
  width: 40,
  height: 4,
  backgroundColor: Theme.colors.border,
  borderRadius: 2,
}
```

### Header

```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: Theme.colors.border,
}
```

### Footer Buttons

```typescript
{
  flexDirection: 'row',
  gap: 12,
  padding: 20,
  paddingTop: 16,
  borderTopWidth: 1,
  borderTopColor: Theme.colors.border,
}
```

---

## 📊 API Integration

### Create Bed

```typescript
POST /api/v1/beds
Headers:
  X-PG-Location-Id: 1
  X-Organization-Id: 1
  X-User-Id: 1

Body:
{
  "room_id": 1,
  "bed_no": "BD1",
  "pg_id": 1,
  "images": ["data:image/jpeg;base64,..."]
}

Response:
{
  "success": true,
  "data": {
    "s_no": 1,
    "bed_no": "BD1",
    "room_id": 1,
    "is_occupied": false,
    ...
  }
}
```

### Update Bed

```typescript
PATCH /api/v1/beds/:id
Headers:
  X-PG-Location-Id: 1
  X-Organization-Id: 1
  X-User-Id: 1

Body:
{
  "bed_no": "BD2",
  "images": ["data:image/jpeg;base64,..."]
}
```

### Delete Bed

```typescript
DELETE /api/v1/beds/:id
Headers:
  X-PG-Location-Id: 1
  X-Organization-Id: 1
  X-User-Id: 1

Response:
{
  "success": true,
  "message": "Bed deleted successfully"
}
```

---

## ✨ Features

### 1. **BD Prefix**
- All bed numbers start with "BD"
- Prefix is fixed and cannot be edited
- User types only the identifier
- Examples: BD1, BD2, BD-A, BD-101

### 2. **Image Upload**
- Up to 3 images per bed
- Camera and gallery support
- Base64 encoding
- Preview thumbnails
- Remove images

### 3. **Validation**
- Bed number required
- Cannot be just "BD"
- Clear error messages
- Real-time validation

### 4. **Loading States**
- Activity indicator during submission
- Disabled buttons when loading
- Prevents double submission

### 5. **Keyboard Handling**
- KeyboardAvoidingView for iOS/Android
- Modal adjusts for keyboard
- Smooth user experience

---

## 🎯 Bed Number Examples

| User Types | Stored As | Display |
|------------|-----------|---------|
| 1          | BD1       | BD1     |
| 2          | BD2       | BD2     |
| A          | BDA       | BDA     |
| 101        | BD101     | BD101   |
| A-1        | BDA-1     | BDA-1   |

---

## 🔄 State Management

### Modal State

```typescript
const [bedModalVisible, setBedModalVisible] = useState(false);
const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
```

### Form State

```typescript
const [formData, setFormData] = useState({
  bed_no: 'BD',
  images: [] as string[],
});
```

### Loading State

```typescript
const [loading, setLoading] = useState(false);
```

---

## 🎉 Benefits

### User Experience
✅ **No Navigation** - Stays on same screen  
✅ **Quick Access** - Faster than navigating  
✅ **Visual Feedback** - Smooth animations  
✅ **Context Preserved** - Room details visible  

### Developer Experience
✅ **Reusable Component** - Can be used anywhere  
✅ **Clean Code** - Separated concerns  
✅ **Type Safe** - Full TypeScript support  
✅ **Easy to Maintain** - Well documented  

### Performance
✅ **Lightweight** - No route navigation  
✅ **Fast Animations** - Native driver  
✅ **Efficient Updates** - Only refreshes bed list  

---

## 🧪 Testing Checklist

- [ ] Open bottom sheet (slides up smoothly)
- [ ] Close bottom sheet (slides down smoothly)
- [ ] Close with backdrop tap
- [ ] Close with X button
- [ ] Create bed with BD prefix
- [ ] Edit existing bed
- [ ] Delete bed with confirmation
- [ ] Upload images
- [ ] Form validation works
- [ ] Loading states display
- [ ] Keyboard handling works
- [ ] Bed list refreshes after create/edit/delete
- [ ] Total beds count updates

---

## 📖 Usage Example

```typescript
import { BedFormModal } from '../../components/BedFormModal';

const [bedModalVisible, setBedModalVisible] = useState(false);
const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

// Add bed
const handleAddBed = () => {
  setSelectedBed(null);
  setBedModalVisible(true);
};

// Edit bed
const handleEditBed = (bed: Bed) => {
  setSelectedBed(bed);
  setBedModalVisible(true);
};

// Success callback
const handleBedFormSuccess = async () => {
  await loadBeds();
  await loadRoomDetails();
};

<BedFormModal
  visible={bedModalVisible}
  onClose={() => setBedModalVisible(false)}
  onSuccess={handleBedFormSuccess}
  roomId={roomId}
  roomNo={roomNo}
  bed={selectedBed}
  pgId={pgId}
  organizationId={organizationId}
  userId={userId}
/>
```

---

## 🚀 Summary

✅ **Bottom Sheet Modal** - Smooth slide-up animation  
✅ **BD Prefix** - Automatic bed number formatting  
✅ **Image Upload** - Up to 3 images per bed  
✅ **CRUD Operations** - Create, Read, Update, Delete  
✅ **Validation** - Form validation with errors  
✅ **Loading States** - Activity indicators  
✅ **Keyboard Aware** - Adjusts for keyboard  
✅ **Reusable Component** - Can be used anywhere  

**Bed management is now complete with a beautiful bottom sheet modal!** 🛏️✨
