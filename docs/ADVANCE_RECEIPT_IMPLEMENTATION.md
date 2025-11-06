# Advance Payment Receipt Implementation

## 🎯 Overview

Added receipt functionality for advance payments in TenantDetailsScreen, matching the existing rent payment receipt feature. Users can now view, share via WhatsApp, and share advance payment receipts.

## ✅ What Was Implemented

### **1. Receipt Data Preparation**

Added `prepareAdvanceReceiptData` function to format advance payment data:

```typescript
const prepareAdvanceReceiptData = (payment: any) => {
  return {
    receiptNumber: `ADV-${payment.s_no}-${new Date(payment.payment_date).getFullYear()}`,
    paymentDate: payment.payment_date,
    tenantName: currentTenant?.name || '',
    tenantPhone: currentTenant?.phone_no || '',
    pgName: currentTenant?.pg_locations?.location_name || 'PG',
    roomNumber: payment.rooms?.room_no || currentTenant?.rooms?.room_no || '',
    bedNumber: payment.beds?.bed_no || currentTenant?.beds?.bed_no || '',
    rentPeriod: {
      startDate: payment.payment_date,
      endDate: payment.payment_date,
    },
    actualRent: Number(payment.amount_paid || 0),
    amountPaid: Number(payment.amount_paid || 0),
    paymentMethod: payment.payment_method || 'CASH',
    remarks: payment.remarks,
    receiptType: 'ADVANCE' as const, // Identifies as advance receipt
  };
};
```

### **2. Receipt Handler Functions**

Added three handler functions for advance payment receipts:

#### **View Receipt**
```typescript
const handleViewAdvanceReceipt = (payment: any) => {
  const data = prepareAdvanceReceiptData(payment);
  setReceiptData(data);
  setReceiptModalVisible(true);
};
```

#### **WhatsApp Receipt**
```typescript
const handleWhatsAppAdvanceReceipt = async (payment: any) => {
  try {
    const data = prepareAdvanceReceiptData(payment);
    setReceiptData(data);
    
    setTimeout(async () => {
      await CompactReceiptGenerator.shareViaWhatsApp(
        receiptRef,
        data,
        currentTenant?.phone_no || ''
      );
      setReceiptData(null);
    }, 100);
  } catch (error) {
    Alert.alert('Error', 'Failed to send via WhatsApp');
    setReceiptData(null);
  }
};
```

#### **Share Receipt**
```typescript
const handleShareAdvanceReceipt = async (payment: any) => {
  try {
    const data = prepareAdvanceReceiptData(payment);
    setReceiptData(data);
    
    setTimeout(async () => {
      await CompactReceiptGenerator.shareImage(receiptRef);
      setReceiptData(null);
    }, 100);
  } catch (error) {
    Alert.alert('Error', 'Failed to share receipt');
    setReceiptData(null);
  }
};
```

### **3. UI Buttons**

Added three receipt action buttons for PAID advance payments:

```tsx
{payment.status === 'PAID' && (
  <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#D1FAE5' }}>
    {/* View Button */}
    <TouchableOpacity onPress={() => handleViewAdvanceReceipt(payment)}>
      <Ionicons name="receipt-outline" size={14} color="#10B981" />
      <Text>View</Text>
    </TouchableOpacity>

    {/* WhatsApp Button */}
    <TouchableOpacity onPress={() => handleWhatsAppAdvanceReceipt(payment)}>
      <Ionicons name="logo-whatsapp" size={14} color="#10B981" />
      <Text>WhatsApp</Text>
    </TouchableOpacity>

    {/* Share Button */}
    <TouchableOpacity onPress={() => handleShareAdvanceReceipt(payment)}>
      <Ionicons name="share-outline" size={14} color="#10B981" />
      <Text>Share</Text>
    </TouchableOpacity>
  </View>
)}
```

### **4. Receipt Component Update**

Updated `CompactReceiptGenerator` to support both rent and advance receipts:

#### **Interface Update**
```typescript
interface ReceiptData {
  // ... existing fields
  receiptType?: 'RENT' | 'ADVANCE'; // Added
}
```

#### **Dynamic Header**
```tsx
<Text style={styles.receiptTitle}>
  {data.receiptType === 'ADVANCE' ? 'ADVANCE RECEIPT' : 'RENT RECEIPT'}
</Text>
```

## 🎨 Receipt Appearance

### **Advance Receipt Header**
```
┌────────────────────────────────┐
│           🏠                   │
│      PG Management             │
│     ADVANCE RECEIPT            │ ← Shows "ADVANCE RECEIPT"
└────────────────────────────────┘
```

### **Rent Receipt Header**
```
┌────────────────────────────────┐
│           🏠                   │
│      PG Management             │
│      RENT RECEIPT              │ ← Shows "RENT RECEIPT"
└────────────────────────────────┘
```

## 📊 Receipt Details

### **Advance Receipt**
- **Receipt Number**: `ADV-123-2025` (ADV prefix)
- **Payment Date**: Date of advance payment
- **Rent Period**: Same as payment date (start = end)
- **Amount**: Advance amount paid
- **Type**: Labeled as "ADVANCE RECEIPT"

### **Rent Receipt**
- **Receipt Number**: `RCP-456-2025` (RCP prefix)
- **Payment Date**: Date of rent payment
- **Rent Period**: Start date to end date
- **Amount**: Rent amount paid
- **Type**: Labeled as "RENT RECEIPT"

## 🎯 User Flow

### **Viewing Advance Receipt**
```
1. User opens Tenant Details
   ↓
2. Navigates to "Advance Payments" tab
   ↓
3. Sees list of advance payments
   ↓
4. For PAID payments, sees 3 buttons:
   - View
   - WhatsApp
   - Share
   ↓
5. Clicks "View" button
   ↓
6. Receipt modal opens
   ↓
7. Shows advance receipt with:
   - "ADVANCE RECEIPT" header
   - Receipt number (ADV-xxx)
   - Tenant details
   - Payment details
   - Amount paid
```

### **Sharing via WhatsApp**
```
1. User clicks "WhatsApp" button
   ↓
2. Receipt is generated as image
   ↓
3. WhatsApp opens with:
   - Receipt image attached
   - Pre-filled message
   - Tenant's phone number
   ↓
4. User can send directly
```

### **General Share**
```
1. User clicks "Share" button
   ↓
2. Receipt is generated as image
   ↓
3. System share dialog opens
   ↓
4. User can share via:
   - Email
   - Messages
   - Other apps
```

## 🔧 Files Modified

### **1. TenantDetailsScreen.tsx**
- Added `prepareAdvanceReceiptData` function
- Added `handleViewAdvanceReceipt` handler
- Added `handleWhatsAppAdvanceReceipt` handler
- Added `handleShareAdvanceReceipt` handler
- Added receipt buttons UI for advance payments

### **2. compactReceiptGenerator.tsx**
- Updated `ReceiptData` interface with `receiptType` field
- Updated receipt header to show dynamic title based on type

## ✅ Features

- ✅ View advance payment receipts
- ✅ Share via WhatsApp with pre-filled message
- ✅ Share via system share dialog
- ✅ Distinct receipt number format (ADV- prefix)
- ✅ Dynamic receipt header (ADVANCE RECEIPT)
- ✅ Only shows for PAID status
- ✅ Matches rent receipt design
- ✅ Uses existing receipt infrastructure

## 🎨 UI Design

### **Button Styling**
- **Background**: Light green (#ECFDF5)
- **Border**: Green (#10B981)
- **Icon Color**: Green (#10B981)
- **Text Color**: Green (#10B981)
- **Layout**: 3 equal-width buttons in a row
- **Spacing**: 6px gap between buttons
- **Border Top**: Separator line above buttons

### **Visibility**
- Only shown for payments with `status === 'PAID'`
- Hidden for PENDING, FAILED, or other statuses
- Consistent with rent payment receipt behavior

## 📈 Benefits

### **Before**
```
❌ No receipt for advance payments
❌ Can't share advance payment proof
❌ Manual receipt creation needed
❌ Inconsistent with rent payments
```

### **After**
```
✅ Professional advance receipts
✅ Easy WhatsApp sharing
✅ Multiple share options
✅ Consistent with rent payments
✅ Automated receipt generation
```

## 🧪 Testing Checklist

- [ ] View advance receipt modal opens
- [ ] Receipt shows "ADVANCE RECEIPT" header
- [ ] Receipt number has "ADV-" prefix
- [ ] All tenant details displayed correctly
- [ ] Payment amount shown correctly
- [ ] WhatsApp share works
- [ ] General share works
- [ ] Buttons only show for PAID status
- [ ] Receipt image quality is good
- [ ] Works on both iOS and Android

## 📝 Usage Example

```typescript
// In TenantDetailsScreen
{tenant.advance_payments?.map((payment) => (
  <View key={payment.s_no}>
    {/* Payment details */}
    
    {/* Receipt buttons - only for PAID */}
    {payment.status === 'PAID' && (
      <View style={styles.receiptButtons}>
        <TouchableOpacity onPress={() => handleViewAdvanceReceipt(payment)}>
          <Text>View</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleWhatsAppAdvanceReceipt(payment)}>
          <Text>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleShareAdvanceReceipt(payment)}>
          <Text>Share</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
))}
```

## 🎉 Result

Advance payments now have the same professional receipt functionality as rent payments, providing a consistent and complete payment management experience!

---

**Last Updated**: Nov 6, 2025  
**Feature**: Advance Payment Receipts  
**Status**: ✅ Complete  
**Consistency**: Matches Rent Receipt Implementation
