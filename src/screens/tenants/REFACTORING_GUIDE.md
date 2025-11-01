# TenantDetailsScreen Refactoring Guide

## ✅ Components Created

The TenantDetailsScreen has been split into smaller, reusable components for better maintainability:

### 1. **TenantHeader** (`components/TenantHeader.tsx`)
- Displays tenant avatar/image
- Shows tenant name, ID, and status badge
- Contact action buttons (Call, WhatsApp, Email)
- Payment action buttons (Add Payment, Add Advance, Add Refund)
- Edit button

**Props:**
```typescript
{
  tenant: Tenant;
  onEdit: () => void;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
  onEmail: (email: string) => void;
  onAddPayment: () => void;
  onAddAdvance: () => void;
  onAddRefund: () => void;
}
```

### 2. **PendingPaymentAlert** (`components/PendingPaymentAlert.tsx`)
- Shows pending payment status with color-coded alerts
- Displays total pending amount
- Shows overdue months count
- Expandable monthly breakdown
- Handles OVERDUE, PARTIAL, and PENDING statuses

**Props:**
```typescript
{
  pendingPayment: PendingPayment;
}
```

### 3. **AccommodationDetails** (`components/AccommodationDetails.tsx`)
- PG Location information
- Room and Bed details
- Check-in date
- Check-out date with Change/Clear buttons

**Props:**
```typescript
{
  tenant: Tenant;
  onChangeCheckoutDate: () => void;
  onClearCheckout: () => void;
  checkoutLoading: boolean;
}
```

### 4. **PersonalInformation** (`components/PersonalInformation.tsx`)
- Phone number
- WhatsApp number
- Email
- Occupation
- Address
- City and State

**Props:**
```typescript
{
  tenant: Tenant;
}
```

## 📦 Component Structure

```
src/screens/tenants/
├── components/
│   ├── index.ts                      # Export all components
│   ├── TenantHeader.tsx              # Header with actions
│   ├── PendingPaymentAlert.tsx       # Payment alerts
│   ├── AccommodationDetails.tsx      # Room/bed info
│   └── PersonalInformation.tsx       # Contact details
├── TenantDetailsScreen.tsx           # Main screen (uses components)
├── AddTenantScreen.tsx
└── TenantsScreen.tsx
```

## 🔄 Next Steps to Complete Refactoring

### Remaining Sections to Extract:

1. **RentPaymentsSection** - Rent payment history with edit/delete
2. **AdvancePaymentsSection** - Advance payment history
3. **RefundPaymentsSection** - Refund payment history  
4. **ProofDocumentsSection** - Document viewer
5. **TenantImagesSection** - Image gallery

### How to Use in TenantDetailsScreen:

```typescript
import {
  TenantHeader,
  PendingPaymentAlert,
  AccommodationDetails,
  PersonalInformation,
} from './components';

// In render:
<TenantHeader
  tenant={tenant}
  onEdit={() => navigation.navigate('AddTenant', { tenantId: currentTenant.s_no })}
  onCall={handleCall}
  onWhatsApp={handleWhatsApp}
  onEmail={handleEmail}
  onAddPayment={() => setPaymentModalVisible(true)}
  onAddAdvance={() => setAdvancePaymentModalVisible(true)}
  onAddRefund={() => setRefundPaymentModalVisible(true)}
/>

{tenant.pending_payment && (
  <PendingPaymentAlert pendingPayment={tenant.pending_payment} />
)}

<AccommodationDetails
  tenant={tenant}
  onChangeCheckoutDate={handleChangeCheckoutDate}
  onClearCheckout={handleClearCheckout}
  checkoutLoading={checkoutLoading}
/>

<PersonalInformation tenant={tenant} />
```

## ✨ Benefits

1. **Better Code Organization** - Each component has a single responsibility
2. **Reusability** - Components can be used in other screens
3. **Easier Testing** - Smaller components are easier to test
4. **Better Maintainability** - Changes are isolated to specific components
5. **Improved Readability** - Main screen is much cleaner

## 🐛 Current Status

- ✅ Components created and exported
- ✅ Types properly defined
- ⚠️ Main screen needs cleanup to remove duplicate code
- ⚠️ Payment sections still need to be extracted

## 🔧 To Fix Duplicate Code

The TenantDetailsScreen.tsx currently has duplicate sections that need to be removed. The old inline code should be deleted and replaced with the component calls shown above.

Search for these sections and remove them:
- Old header card (lines ~400-620)
- Old pending payment alert (lines ~623-768)
- Old accommodation details (lines ~766-880)
- Old personal information (lines ~880-940)
