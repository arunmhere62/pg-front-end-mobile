# Beds Screen with Filters - Complete Implementation ✅

## Overview

Created a comprehensive Beds screen with quick actions, room-wise filtering, and occupancy status filtering.

---

## 📁 Files Created

### **`src/screens/beds/BedsScreen.tsx`**
Complete beds management screen with:
- List all beds
- Room-wise filter
- Occupancy filter (All/Available/Occupied)
- Search functionality
- Quick add bed action
- Edit/Delete actions
- Bottom sheet modal integration

---

## 🎨 Screen Layout

```
┌─────────────────────────────────────┐
│ ← Beds                    25 total  │  Header
├─────────────────────────────────────┤
│ [Search...] [🔍] [🔽2]             │  Search & Filter
│                                     │
│ ┌─ Filters ─────────────────────┐  │
│ │ Filter by Room                │  │
│ │ [All] [RM101] [RM102]         │  │
│ │                               │  │
│ │ Filter by Status              │  │
│ │ [All] [Available] [Occupied]  │  │
│ │                               │  │
│ │ [Clear All Filters]           │  │
│ └───────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐   │
│ │ 🛏️ BED1        [Edit][Delete]│   │
│ │ 🟢 Available                 │   │
│ │ Room: RM101                  │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 🛏️ BED2        [Edit][Delete]│   │
│ │ 🔴 Occupied                  │   │
│ │ Room: RM101                  │   │
│ │ Tenant: John Doe             │   │
│ └─────────────────────────────┘   │
│                                     │
│                            [+]      │  FAB
└─────────────────────────────────────┘
```

---

## ✨ Features

### 1. **Room-Wise Filter**
Filter beds by specific room or view all rooms:
```typescript
// Filter options
- All Rooms (default)
- RM101
- RM102
- RM103
...
```

**Implementation:**
```typescript
const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

// Load beds for specific room
if (selectedRoomId) {
  response = await getBedsByRoomId(selectedRoomId, headers);
} else {
  response = await getAllBeds({ pg_id, limit: 100 }, headers);
}
```

### 2. **Occupancy Filter**
Filter by bed availability status:
```typescript
// Filter options
- All (default)
- Available (🟢)
- Occupied (🔴)
```

**Implementation:**
```typescript
const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'occupied' | 'available'>('all');

// Apply occupancy filter
if (occupancyFilter === 'occupied') {
  filteredBeds = filteredBeds.filter((bed) => bed.is_occupied);
} else if (occupancyFilter === 'available') {
  filteredBeds = filteredBeds.filter((bed) => !bed.is_occupied);
}
```

### 3. **Search Functionality**
Search beds by bed number:
```typescript
const handleSearch = async () => {
  const response = await getAllBeds(
    {
      pg_id: selectedPGLocationId,
      search: searchQuery,
      limit: 100,
    },
    headers
  );
  // Apply additional filters
  setBeds(filteredBeds);
};
```

### 4. **Quick Actions**
- **Add Bed** - Floating action button
- **Edit Bed** - Edit button on each card
- **Delete Bed** - Delete button with confirmation

### 5. **Filter Toggle**
Collapsible filter section with badge showing active filter count:
```typescript
const getFilterCount = () => {
  let count = 0;
  if (selectedRoomId) count++;
  if (occupancyFilter !== 'all') count++;
  return count;
};
```

---

## 🎯 API Integration

### Get All Beds
```typescript
GET /api/v1/beds
Query Params:
  - page: 1
  - limit: 100
  - search: "BED1"
  - room_id: 1

Headers:
  X-PG-Location-Id: 1
  X-Organization-Id: 1
  X-User-Id: 1

Response:
{
  "success": true,
  "data": [
    {
      "s_no": 1,
      "bed_no": "BED1",
      "room_id": 1,
      "is_occupied": false,
      "rooms": {
        "s_no": 1,
        "room_no": "RM101"
      },
      "tenants": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 25,
    "totalPages": 1,
    "hasMore": false
  }
}
```

### Get Beds by Room
```typescript
GET /api/v1/beds/room/:roomId

Headers:
  X-PG-Location-Id: 1
  X-Organization-Id: 1
  X-User-Id: 1

Response: Same as above
```

---

## 🎨 Bed Card Design

### Available Bed
```
┌─────────────────────────────────┐
│ 🛏️  BED1          [Edit][Delete]│
│ 🟢  Available                   │
│                                 │
│ ┌─ ROOM ───────────────────┐   │
│ │ RM101                     │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

### Occupied Bed
```
┌─────────────────────────────────┐
│ 🛏️  BED2          [Edit][Delete]│
│ 🔴  Occupied                    │
│                                 │
│ ┌─ ROOM ───────────────────┐   │
│ │ RM101                     │   │
│ └───────────────────────────┘   │
│                                 │
│ ┌─ TENANT ─────────────────┐   │
│ │ John Doe                  │   │
│ │ +91 9876543210            │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 🎨 Styling

### Bed Icon Colors
```typescript
// Available
backgroundColor: '#DCFCE7' (light green)
iconColor: '#16A34A' (green)

// Occupied
backgroundColor: '#FEE2E2' (light red)
iconColor: '#DC2626' (red)
```

### Status Indicator
```typescript
// Available
<View style={{
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#16A34A',
}} />

// Occupied
<View style={{
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#DC2626',
}} />
```

### Filter Buttons
```typescript
// Active filter
backgroundColor: Theme.colors.primary
color: '#fff'

// Inactive filter
backgroundColor: '#fff'
color: Theme.colors.text.secondary
borderColor: Theme.colors.border
```

---

## 📊 Filter Logic

### Combined Filters
Filters work together:
1. **Room Filter** → Filters by room_id
2. **Occupancy Filter** → Filters by is_occupied
3. **Search** → Searches bed_no

**Example:**
- Room: RM101
- Status: Available
- Search: "BED"

Result: Shows only available beds in RM101 with "BED" in name

---

## 🔄 State Management

### Filter States
```typescript
const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'occupied' | 'available'>('all');
const [showFilters, setShowFilters] = useState(false);
```

### Data States
```typescript
const [beds, setBeds] = useState<Bed[]>([]);
const [rooms, setRooms] = useState<Room[]>([]);
const [loading, setLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
```

### Modal States
```typescript
const [bedModalVisible, setBedModalVisible] = useState(false);
const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
```

---

## 🎯 User Flow

### Filtering Beds

1. **User taps filter icon**
2. **Filter panel expands**
3. **User selects room (e.g., RM101)**
4. **Beds list updates to show only RM101 beds**
5. **User selects status (e.g., Available)**
6. **List updates to show only available beds in RM101**
7. **Filter badge shows "2" (2 active filters)**

### Adding a Bed

1. **User taps FAB (+) button**
2. **Bottom sheet modal slides up**
3. **User enters bed number**
4. **User uploads images (optional)**
5. **User taps "Create"**
6. **Bed is created**
7. **Modal closes**
8. **List refreshes with new bed**

### Clearing Filters

1. **User taps "Clear All Filters"**
2. **All filters reset to default**
3. **List shows all beds**
4. **Filter badge disappears**

---

## 🎨 Visual Indicators

### Filter Badge
```typescript
{getFilterCount() > 0 && (
  <View style={{
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Text style={{ fontSize: 11, fontWeight: '700', color: Theme.colors.primary }}>
      {getFilterCount()}
    </Text>
  </View>
)}
```

### Status Colors
```typescript
// Available
🟢 Green (#16A34A)

// Occupied
🔴 Red (#DC2626)
```

---

## 📱 Responsive Design

### Filter Panel
- Collapsible to save space
- Shows active filter count
- Scrollable room list
- Clear all button when filters active

### Bed Cards
- Full width with padding
- Responsive layout
- Touch-friendly buttons
- Clear visual hierarchy

---

## ✅ Features Summary

✅ **List All Beds** - View all beds across all rooms  
✅ **Room Filter** - Filter by specific room  
✅ **Occupancy Filter** - Filter by available/occupied  
✅ **Search** - Search by bed number  
✅ **Quick Add** - FAB for quick bed creation  
✅ **Edit/Delete** - Inline actions on each card  
✅ **Filter Badge** - Shows active filter count  
✅ **Clear Filters** - Reset all filters at once  
✅ **Tenant Info** - Shows tenant details if occupied  
✅ **Room Info** - Shows room number for each bed  
✅ **Pull to Refresh** - Refresh bed list  
✅ **Empty States** - Clear messages when no beds  
✅ **Loading States** - Activity indicators  
✅ **Bottom Sheet** - Modal for add/edit  

---

## 🚀 Usage

### Navigation
Add to your navigation stack:
```typescript
<Stack.Screen 
  name="Beds" 
  component={BedsScreen}
  options={{ headerShown: false }}
/>
```

### Quick Actions Menu
Add to your main menu:
```typescript
<TouchableOpacity onPress={() => navigation.navigate('Beds')}>
  <Ionicons name="bed" size={24} />
  <Text>Beds</Text>
</TouchableOpacity>
```

---

## 🎉 Summary

✅ **Comprehensive Bed Management** - Full CRUD operations  
✅ **Advanced Filtering** - Room + Occupancy + Search  
✅ **Beautiful UI** - Modern design with icons  
✅ **Quick Actions** - FAB and inline buttons  
✅ **Real-time Updates** - Instant filter application  
✅ **Empty States** - Clear user guidance  
✅ **Bottom Sheet Modal** - Smooth UX for add/edit  

**Beds screen is now fully functional with advanced filtering capabilities!** 🛏️✨🎉
