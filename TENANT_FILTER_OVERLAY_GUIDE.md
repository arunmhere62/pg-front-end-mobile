# Tenant Filter Overlay Modal - Implementation Guide

## Overview

Guide to implement the same filter overlay modal UI in TenantsScreen as implemented in BedsScreen.

---

## 🎯 Changes Needed

### 1. **Add Required Imports**
```typescript
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
```

### 2. **Add Helper Functions**
```typescript
const clearFilters = () => {
  setStatusFilter('ALL');
  setSelectedRoomId(null);
  setPendingRentFilter(false);
  setPendingAdvanceFilter(false);
};

const getFilterCount = () => {
  let count = 0;
  if (statusFilter !== 'ALL') count++;
  if (selectedRoomId !== null) count++;
  if (pendingRentFilter) count++;
  if (pendingAdvanceFilter) count++;
  return count;
};
```

### 3. **Replace Search Bar**

**Remove:**
- Inline status filter chips
- Inline room dropdown
- Inline payment filter chips

**Add:**
- Filter button with badge
- Ionicons for search and filter

```typescript
<View style={{ flexDirection: 'row', gap: 8 }}>
  <TextInput
    style={{
      flex: 1,
      backgroundColor: Theme.colors.background.secondary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
    }}
    placeholder="Search by name, phone, ID..."
    value={searchQuery}
    onChangeText={setSearchQuery}
    onSubmitEditing={handleSearch}
  />
  <TouchableOpacity
    onPress={handleSearch}
    style={{
      backgroundColor: Theme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: 14,
      justifyContent: 'center',
    }}
  >
    <Ionicons name="search" size={18} color="#fff" />
  </TouchableOpacity>
  <TouchableOpacity
    onPress={() => setShowFilters(!showFilters)}
    style={{
      backgroundColor: getFilterCount() > 0 ? Theme.colors.primary : Theme.colors.light,
      borderRadius: 8,
      paddingHorizontal: 14,
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    }}
  >
    <Ionicons name="filter" size={18} color={getFilterCount() > 0 ? '#fff' : Theme.colors.text.primary} />
    {getFilterCount() > 0 && (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          width: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: Theme.colors.primary }}>
          {getFilterCount()}
        </Text>
      </View>
    )}
  </TouchableOpacity>
</View>
```

### 4. **Add Filter Overlay Modal**

```typescript
{/* Filter Modal Overlay */}
<Modal
  visible={showFilters}
  transparent
  animationType="fade"
  onRequestClose={() => setShowFilters(false)}
>
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => setShowFilters(false)}
    style={{
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    }}
  >
    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
      <View
        style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: SCREEN_HEIGHT * 0.7,
          ...Theme.colors.shadows.large,
        }}
      >
        {/* Handle Bar */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: Theme.colors.border,
              borderRadius: 2,
            }}
          />
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: Theme.colors.border,
          }}
        >
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
              Filter Tenants
            </Text>
            {getFilterCount() > 0 && (
              <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                {getFilterCount()} filter{getFilterCount() > 1 ? 's' : ''} active
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: Theme.colors.light,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={20} color={Theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Filter Content */}
        <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.5 }} contentContainerStyle={{ padding: 20 }}>
          {/* Status Filter */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
              Filter by Status
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setStatusFilter(status as any)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: statusFilter === status ? Theme.colors.primary : '#fff',
                    borderWidth: 1,
                    borderColor: statusFilter === status ? Theme.colors.primary : Theme.colors.border,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: statusFilter === status ? '#fff' : Theme.colors.text.secondary,
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Room Filter */}
          {rooms.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                Filter by Room
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setSelectedRoomId(null)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: selectedRoomId === null ? Theme.colors.primary : '#fff',
                    borderWidth: 1,
                    borderColor: selectedRoomId === null ? Theme.colors.primary : Theme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: selectedRoomId === null ? '#fff' : Theme.colors.text.secondary,
                    }}
                  >
                    All Rooms
                  </Text>
                </TouchableOpacity>
                {rooms.map((room: any) => (
                  <TouchableOpacity
                    key={room.s_no}
                    onPress={() => setSelectedRoomId(room.s_no)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: selectedRoomId === room.s_no ? Theme.colors.primary : '#fff',
                      borderWidth: 1,
                      borderColor: selectedRoomId === room.s_no ? Theme.colors.primary : Theme.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: selectedRoomId === room.s_no ? '#fff' : Theme.colors.text.secondary,
                      }}
                    >
                      {room.room_no}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Payment Filters */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
              Payment Filters
            </Text>
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => setPendingRentFilter(!pendingRentFilter)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: pendingRentFilter ? '#EF4444' : '#fff',
                  borderWidth: 1,
                  borderColor: pendingRentFilter ? '#EF4444' : Theme.colors.border,
                  gap: 8,
                }}
              >
                <Ionicons 
                  name={pendingRentFilter ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={pendingRentFilter ? '#fff' : Theme.colors.text.secondary} 
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: pendingRentFilter ? '#fff' : Theme.colors.text.secondary,
                  }}
                >
                  ⚠️ Pending Rent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPendingAdvanceFilter(!pendingAdvanceFilter)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: pendingAdvanceFilter ? '#F59E0B' : '#fff',
                  borderWidth: 1,
                  borderColor: pendingAdvanceFilter ? '#F59E0B' : Theme.colors.border,
                  gap: 8,
                }}
              >
                <Ionicons 
                  name={pendingAdvanceFilter ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={pendingAdvanceFilter ? '#fff' : Theme.colors.text.secondary} 
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: pendingAdvanceFilter ? '#fff' : Theme.colors.text.secondary,
                  }}
                >
                  💰 No Advance
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            padding: 20,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: Theme.colors.border,
          }}
        >
          {getFilterCount() > 0 && (
            <TouchableOpacity
              onPress={clearFilters}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: Theme.colors.light,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: Theme.colors.primary,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </TouchableOpacity>
</Modal>
```

---

## 🎨 Visual Result

### Before (Inline Filters):
```
┌─────────────────────────────────┐
│ [Search...] [🔍]               │
│ [ALL] [ACTIVE] [INACTIVE]       │ ← Takes space
│ [🏠 Room ▼]                     │
│ [⚠️ Pending Rent] [💰 No Advance]│
├─────────────────────────────────┤
│ [Tenant List]                   │
└─────────────────────────────────┘
```

### After (Overlay Modal):
```
┌─────────────────────────────────┐
│ [Search...] [🔍] [🔽4]         │
├─────────────────────────────────┤
│ [Tenant List]                   │ ← Full space
│ ...                             │
└─────────────────────────────────┘

Tap filter button:
┌─────────────────────────────────┐
│ ████████████████████████████    │
│ ┌───────────────────────────┐  │
│ │  ━━━━                     │  │
│ │  Filter Tenants      ✕    │  │
│ │  4 filters active         │  │
│ ├───────────────────────────┤  │
│ │  Status: [ALL][ACTIVE]    │  │
│ │  Room: [All][RM101]       │  │
│ │  ☑ Pending Rent           │  │
│ │  ☑ No Advance             │  │
│ ├───────────────────────────┤  │
│ │  [Clear] [Apply Filters]  │  │
│ └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## ✅ Benefits

✅ **More Space** - Tenant list uses full screen  
✅ **Better Organization** - All filters in one place  
✅ **Professional UI** - Modern bottom sheet design  
✅ **Easy to Use** - Clear filter options  
✅ **Filter Badge** - Shows active filter count  
✅ **Consistent** - Matches Beds screen UI  

---

## 🎉 Summary

This guide provides the complete implementation for converting the TenantsScreen inline filters to an overlay modal, matching the BedsScreen UI pattern.

**Key Changes:**
1. Add Ionicons and Dimensions imports
2. Add helper functions (clearFilters, getFilterCount)
3. Replace search bar with filter button
4. Add overlay modal with all filters
5. Remove inline filter chips

**Result:** Clean, professional filter UI that doesn't affect tenant list layout!
