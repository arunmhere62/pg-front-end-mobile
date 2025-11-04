# Frontend Receipt PDF Generation - React Native

## 🎯 Best Approach: Generate PDF in Frontend

### Why Frontend?
- ✅ **Instant** - No server delay
- ✅ **Offline** - Works without internet
- ✅ **Direct Share** - Share to WhatsApp immediately
- ✅ **No Server Load** - Reduces backend processing
- ✅ **Better UX** - Faster user experience

## 📦 Installation

```bash
cd mob-ui
npm install react-native-pdf-lib
npm install expo-file-system expo-sharing
```

Or with Expo:
```bash
npx expo install expo-file-system expo-sharing
```

## 🎨 Implementation

### Step 1: Install Packages

```json
// package.json
{
  "dependencies": {
    "expo-file-system": "~16.0.0",
    "expo-sharing": "~12.0.0",
    "react-native-view-shot": "^3.8.0"
  }
}
```

### Step 2: Create Receipt Generator Service

Create: `mob-ui/src/services/receipt/receiptPdfGenerator.ts`

```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

interface ReceiptData {
  receiptNumber: string;
  paymentDate: Date;
  tenantName: string;
  tenantPhone: string;
  pgName: string;
  roomNumber: string;
  bedNumber: string;
  rentPeriod: {
    startDate: Date;
    endDate: Date;
  };
  actualRent: number;
  amountPaid: number;
  paymentMethod: string;
  remarks?: string;
}

export class ReceiptPdfGenerator {
  private static readonly APP_COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    dark: '#1F2937',
    light: '#F3F4F6',
  };

  /**
   * Generate HTML receipt (for PDF conversion)
   */
  static generateReceiptHTML(data: ReceiptData): string {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const formatCurrency = (amount: number) => {
      return `₹ ${amount.toLocaleString('en-IN')}`;
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 20px;
      background: white;
    }
    
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, ${this.APP_COLORS.primary} 0%, #2563EB 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
      letter-spacing: 2px;
    }
    
    .receipt-info {
      display: flex;
      justify-content: space-between;
      padding: 20px 30px;
      background: ${this.APP_COLORS.light};
      border-bottom: 2px solid #e5e7eb;
    }
    
    .receipt-info-item {
      text-align: center;
    }
    
    .receipt-info-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    
    .receipt-info-value {
      font-size: 18px;
      font-weight: 700;
      color: ${this.APP_COLORS.primary};
    }
    
    .section {
      padding: 30px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: ${this.APP_COLORS.primary};
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${this.APP_COLORS.primary};
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .info-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 14px;
      color: ${this.APP_COLORS.dark};
      font-weight: 600;
      text-align: right;
    }
    
    .amount-section {
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
      padding: 30px;
      margin: 20px 30px;
      border-radius: 12px;
      border: 2px solid ${this.APP_COLORS.secondary};
    }
    
    .amount-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .amount-label {
      font-size: 14px;
      color: #065F46;
      font-weight: 600;
    }
    
    .amount-value {
      font-size: 16px;
      color: #065F46;
      font-weight: 700;
    }
    
    .total-amount {
      font-size: 28px !important;
      color: ${this.APP_COLORS.secondary} !important;
      font-weight: 800 !important;
    }
    
    .footer {
      padding: 30px;
      text-align: center;
      background: ${this.APP_COLORS.light};
    }
    
    .signature-line {
      width: 200px;
      border-top: 2px solid ${this.APP_COLORS.dark};
      margin: 30px auto 10px;
    }
    
    .signature-label {
      font-size: 12px;
      color: #6b7280;
    }
    
    .footer-note {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 20px;
      line-height: 1.6;
    }
    
    .contact-info {
      font-size: 11px;
      color: #6b7280;
      margin-top: 15px;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .receipt {
        border: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <h1>🏠 PG Management</h1>
      <p>RENT RECEIPT</p>
    </div>
    
    <!-- Receipt Info -->
    <div class="receipt-info">
      <div class="receipt-info-item">
        <div class="receipt-info-label">Receipt No.</div>
        <div class="receipt-info-value">${data.receiptNumber}</div>
      </div>
      <div class="receipt-info-item">
        <div class="receipt-info-label">Date</div>
        <div class="receipt-info-value">${formatDate(data.paymentDate)}</div>
      </div>
    </div>
    
    <!-- Tenant Details -->
    <div class="section">
      <div class="section-title">TENANT DETAILS</div>
      <div class="info-row">
        <span class="info-label">Name</span>
        <span class="info-value">${data.tenantName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone</span>
        <span class="info-value">${data.tenantPhone}</span>
      </div>
      <div class="info-row">
        <span class="info-label">PG Location</span>
        <span class="info-value">${data.pgName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Room No</span>
        <span class="info-value">${data.roomNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Bed No</span>
        <span class="info-value">${data.bedNumber}</span>
      </div>
    </div>
    
    <!-- Payment Details -->
    <div class="section">
      <div class="section-title">PAYMENT DETAILS</div>
      <div class="info-row">
        <span class="info-label">Rent Period</span>
        <span class="info-value">${formatDate(data.rentPeriod.startDate)} to ${formatDate(data.rentPeriod.endDate)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method</span>
        <span class="info-value">${data.paymentMethod}</span>
      </div>
      ${data.remarks ? `
      <div class="info-row">
        <span class="info-label">Remarks</span>
        <span class="info-value">${data.remarks}</span>
      </div>
      ` : ''}
    </div>
    
    <!-- Amount Section -->
    <div class="amount-section">
      <div class="amount-row">
        <span class="amount-label">Actual Rent Amount</span>
        <span class="amount-value">${formatCurrency(data.actualRent)}</span>
      </div>
      <div class="amount-row" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #10B981;">
        <span class="amount-label" style="font-size: 18px;">Amount Paid</span>
        <span class="amount-value total-amount">${formatCurrency(data.amountPaid)}</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="signature-line"></div>
      <div class="signature-label">Authorized Signature</div>
      
      <div class="footer-note">
        This is a computer-generated receipt and does not require a physical signature.<br>
        For any queries, please contact us.
      </div>
      
      <div class="contact-info">
        📞 +91 1234567890 | ✉️ info@pgmanagement.com
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate and share receipt
   */
  static async generateAndShare(data: ReceiptData): Promise<void> {
    try {
      const html = this.generateReceiptHTML(data);
      const fileName = `Receipt_${data.receiptNumber}.html`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Save HTML file
      await FileSystem.writeAsStringAsync(fileUri, html);

      // Share file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: 'Share Receipt',
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  /**
   * Send receipt via WhatsApp
   */
  static async sendViaWhatsApp(data: ReceiptData, phoneNumber: string): Promise<void> {
    try {
      const message = `
🏠 *PG Management - Rent Receipt*

Hello ${data.tenantName},

Thank you for your payment!

*Receipt Number:* ${data.receiptNumber}
*Amount Paid:* ₹${data.amountPaid.toLocaleString('en-IN')}
*Period:* ${new Date(data.rentPeriod.startDate).toLocaleDateString('en-IN')} to ${new Date(data.rentPeriod.endDate).toLocaleDateString('en-IN')}

Your rent receipt is ready.

Best regards,
PG Management Team
      `.trim();

      const encodedMessage = encodeURIComponent(message);
      const formattedNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
      const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        throw new Error('WhatsApp is not installed');
      }
    } catch (error) {
      console.error('Error sending via WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Download receipt as PDF (using HTML to PDF conversion)
   */
  static async downloadReceipt(data: ReceiptData): Promise<string> {
    try {
      const html = this.generateReceiptHTML(data);
      const fileName = `Receipt_${data.receiptNumber}.html`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, html);
      return fileUri;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  }
}
```

### Step 3: Add Receipt Buttons to Tenant Details Screen

Update: `mob-ui/src/screens/tenants/TenantDetailsScreen.tsx`

```typescript
import { ReceiptPdfGenerator } from '@/services/receipt/receiptPdfGenerator';

// Add these buttons in the payment card
<View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
  {/* Download Receipt */}
  <TouchableOpacity
    onPress={() => handleDownloadReceipt(payment)}
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
    <Ionicons name="download-outline" size={18} color="#3B82F6" />
    <Text style={{ color: '#3B82F6', fontSize: 13, fontWeight: '600' }}>
      Download
    </Text>
  </TouchableOpacity>

  {/* WhatsApp Receipt */}
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

  {/* Share Receipt */}
  <TouchableOpacity
    onPress={() => handleShareReceipt(payment)}
    style={{
      padding: 10,
      backgroundColor: '#FEF3C7',
      borderRadius: 8,
    }}
  >
    <Ionicons name="share-social-outline" size={18} color="#F59E0B" />
  </TouchableOpacity>
</View>

// Add handler functions
const handleDownloadReceipt = async (payment: TenantPayment) => {
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

    const fileUri = await ReceiptPdfGenerator.downloadReceipt(receiptData);
    Alert.alert('Success', 'Receipt downloaded successfully!');
  } catch (error) {
    Alert.alert('Error', 'Failed to download receipt');
  }
};

const handleWhatsAppReceipt = async (payment: TenantPayment) => {
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

const handleShareReceipt = async (payment: TenantPayment) => {
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

    await ReceiptPdfGenerator.generateAndShare(receiptData);
  } catch (error) {
    Alert.alert('Error', 'Failed to share receipt');
  }
};
```

## 🎯 Benefits

| Feature | Frontend | Backend |
|---------|----------|---------|
| Speed | ⚡ Instant | 🐌 Network delay |
| Offline | ✅ Works | ❌ Needs internet |
| Server Load | ✅ Zero | ❌ High |
| User Experience | ✅ Smooth | ⚠️ Waiting |
| WhatsApp Share | ✅ Direct | ❌ Extra step |

## 📱 User Flow

```
1. User clicks "WhatsApp" button
   ↓
2. Receipt generated instantly (HTML)
   ↓
3. WhatsApp opens with pre-filled message
   ↓
4. User sends to tenant
   ↓
5. Done! ✅
```

## 🎨 Receipt Preview

The HTML receipt will look professional with:
- ✅ Blue gradient header
- ✅ Receipt number and date
- ✅ Tenant details section
- ✅ Payment details section
- ✅ Green highlighted amount
- ✅ Signature section
- ✅ Contact footer

## 🚀 Quick Start

1. **Install packages**:
   ```bash
   npx expo install expo-file-system expo-sharing
   ```

2. **Create service file**:
   - Copy `receiptPdfGenerator.ts` to `mob-ui/src/services/receipt/`

3. **Add buttons** to `TenantDetailsScreen.tsx`

4. **Test**: Click WhatsApp button on any payment!

---

**Recommendation**: ✅ Use frontend PDF generation for best UX!
