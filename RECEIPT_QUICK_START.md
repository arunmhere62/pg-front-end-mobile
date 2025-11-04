# Receipt PDF - Quick Start Guide

## ✅ Yes, Frontend is Better!

Generate receipts in the **frontend** for:
- ⚡ **Instant generation** (no server delay)
- 📱 **Direct WhatsApp sharing**
- 🔌 **Works offline**
- 🚀 **Better user experience**

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Package

```bash
cd mob-ui
npx expo install expo-file-system expo-sharing
```

### Step 2: Receipt Service Already Created ✅

File: `mob-ui/src/services/receipt/receiptPdfGenerator.ts`

### Step 3: Add Buttons to Tenant Details

Add to `TenantDetailsScreen.tsx` in the payment card:

```tsx
import { ReceiptPdfGenerator } from '@/services/receipt/receiptPdfGenerator';

// Add these buttons after payment details
<View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
  {/* WhatsApp Button */}
  <TouchableOpacity
    onPress={() => handleWhatsAppReceipt(payment)}
    style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      backgroundColor: '#F0FDF4',
      borderRadius: 8,
      gap: 6,
    }}
  >
    <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
    <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>
      WhatsApp
    </Text>
  </TouchableOpacity>

  {/* Share Button */}
  <TouchableOpacity
    onPress={() => handleShareReceipt(payment)}
    style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      backgroundColor: '#EFF6FF',
      borderRadius: 8,
      gap: 6,
    }}
  >
    <Ionicons name="share-social-outline" size={18} color="#3B82F6" />
    <Text style={{ color: '#3B82F6', fontSize: 13, fontWeight: '600' }}>
      Share
    </Text>
  </TouchableOpacity>
</View>

// Add handler functions
const handleWhatsAppReceipt = async (payment: any) => {
  try {
    const receiptData = {
      receiptNumber: `RCP-${payment.s_no}-${new Date(payment.payment_date).getFullYear()}`,
      paymentDate: payment.payment_date,
      tenantName: tenant.name,
      tenantPhone: tenant.phone_no,
      pgName: tenant.pg_locations?.location_name || 'PG',
      roomNumber: payment.rooms?.room_no || '',
      bedNumber: payment.beds?.bed_no || '',
      rentPeriod: {
        startDate: payment.start_date,
        endDate: payment.end_date,
      },
      actualRent: Number(payment.actual_rent_amount),
      amountPaid: Number(payment.amount_paid),
      paymentMethod: payment.payment_method,
      remarks: payment.remarks,
    };

    await ReceiptPdfGenerator.sendViaWhatsApp(receiptData, tenant.phone_no);
  } catch (error) {
    Alert.alert('Error', 'Failed to send via WhatsApp');
  }
};

const handleShareReceipt = async (payment: any) => {
  try {
    const receiptData = {
      receiptNumber: `RCP-${payment.s_no}-${new Date(payment.payment_date).getFullYear()}`,
      paymentDate: payment.payment_date,
      tenantName: tenant.name,
      tenantPhone: tenant.phone_no,
      pgName: tenant.pg_locations?.location_name || 'PG',
      roomNumber: payment.rooms?.room_no || '',
      bedNumber: payment.beds?.bed_no || '',
      rentPeriod: {
        startDate: payment.start_date,
        endDate: payment.end_date,
      },
      actualRent: Number(payment.actual_rent_amount),
      amountPaid: Number(payment.amount_paid),
      paymentMethod: payment.payment_method,
      remarks: payment.remarks,
    };

    await ReceiptPdfGenerator.downloadAndShare(receiptData);
  } catch (error) {
    Alert.alert('Error', 'Failed to share receipt');
  }
};
```

## 🎨 Receipt Design

Professional receipt with your app colors:
- 🔵 Blue gradient header
- 📄 Receipt number and date
- 👤 Tenant details
- 💰 Green highlighted amount
- ✍️ Signature section

## 📱 User Flow

```
User clicks "WhatsApp" 
    ↓
Receipt generated instantly (HTML)
    ↓
WhatsApp opens with message
    ↓
User sends to tenant
    ↓
Done! ✅
```

## 🎯 Why Frontend?

| Feature | Frontend ✅ | Backend ❌ |
|---------|------------|-----------|
| Speed | Instant | 2-3 seconds |
| Offline | Works | Fails |
| Server Load | Zero | High |
| WhatsApp | Direct | Extra step |

## 🔧 Customization

### Change Colors

Edit `receiptPdfGenerator.ts`:

```typescript
private static readonly APP_COLORS = {
  primary: '#YOUR_COLOR',
  secondary: '#YOUR_COLOR',
  // ...
};
```

### Change Organization Info

In the HTML template, update:
```typescript
<h1>🏠 Your PG Name</h1>
// ...
📞 +91 YOUR_PHONE | ✉️ your@email.com
```

## ✅ Complete!

That's it! Now you can:
- ✅ Generate receipts instantly
- ✅ Send via WhatsApp
- ✅ Share to any app
- ✅ Works offline

---

**Next**: Install package and add buttons to your screen!

```bash
npx expo install expo-file-system expo-sharing
```
