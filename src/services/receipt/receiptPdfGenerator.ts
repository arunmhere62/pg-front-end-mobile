import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking, Alert } from 'react-native';

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
   * Generate HTML receipt
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 20px; background: white; }
    .receipt { max-width: 800px; margin: 0 auto; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${this.APP_COLORS.primary} 0%, #2563EB 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { font-size: 32px; margin-bottom: 10px; font-weight: 700; }
    .header p { font-size: 14px; opacity: 0.9; letter-spacing: 2px; }
    .receipt-info { display: flex; justify-content: space-between; padding: 20px 30px; background: ${this.APP_COLORS.light}; border-bottom: 2px solid #e5e7eb; }
    .receipt-info-item { text-align: center; }
    .receipt-info-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
    .receipt-info-value { font-size: 18px; font-weight: 700; color: ${this.APP_COLORS.primary}; }
    .section { padding: 30px; border-bottom: 1px solid #e5e7eb; }
    .section-title { font-size: 16px; font-weight: 700; color: ${this.APP_COLORS.primary}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${this.APP_COLORS.primary}; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .info-label { font-size: 14px; color: #6b7280; font-weight: 500; }
    .info-value { font-size: 14px; color: ${this.APP_COLORS.dark}; font-weight: 600; text-align: right; }
    .amount-section { background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); padding: 30px; margin: 20px 30px; border-radius: 12px; border: 2px solid ${this.APP_COLORS.secondary}; }
    .amount-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .amount-label { font-size: 14px; color: #065F46; font-weight: 600; }
    .amount-value { font-size: 16px; color: #065F46; font-weight: 700; }
    .total-amount { font-size: 28px !important; color: ${this.APP_COLORS.secondary} !important; font-weight: 800 !important; }
    .footer { padding: 30px; text-align: center; background: ${this.APP_COLORS.light}; }
    .signature-line { width: 200px; border-top: 2px solid ${this.APP_COLORS.dark}; margin: 30px auto 10px; }
    .signature-label { font-size: 12px; color: #6b7280; }
    .footer-note { font-size: 11px; color: #9ca3af; margin-top: 20px; line-height: 1.6; }
    .contact-info { font-size: 11px; color: #6b7280; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>🏠 PG Management</h1>
      <p>RENT RECEIPT</p>
    </div>
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
    <div class="section">
      <div class="section-title">TENANT DETAILS</div>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${data.tenantName}</span></div>
      <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${data.tenantPhone}</span></div>
      <div class="info-row"><span class="info-label">PG Location</span><span class="info-value">${data.pgName}</span></div>
      <div class="info-row"><span class="info-label">Room No</span><span class="info-value">${data.roomNumber}</span></div>
      <div class="info-row"><span class="info-label">Bed No</span><span class="info-value">${data.bedNumber}</span></div>
    </div>
    <div class="section">
      <div class="section-title">PAYMENT DETAILS</div>
      <div class="info-row"><span class="info-label">Rent Period</span><span class="info-value">${formatDate(data.rentPeriod.startDate)} to ${formatDate(data.rentPeriod.endDate)}</span></div>
      <div class="info-row"><span class="info-label">Payment Method</span><span class="info-value">${data.paymentMethod}</span></div>
      ${data.remarks ? `<div class="info-row"><span class="info-label">Remarks</span><span class="info-value">${data.remarks}</span></div>` : ''}
    </div>
    <div class="amount-section">
      <div class="amount-row"><span class="amount-label">Actual Rent Amount</span><span class="amount-value">${formatCurrency(data.actualRent)}</span></div>
      <div class="amount-row" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #10B981;">
        <span class="amount-label" style="font-size: 18px;">Amount Paid</span>
        <span class="amount-value total-amount">${formatCurrency(data.amountPaid)}</span>
      </div>
    </div>
    <div class="footer">
      <div class="signature-line"></div>
      <div class="signature-label">Authorized Signature</div>
      <div class="footer-note">This is a computer-generated receipt and does not require a physical signature.<br>For any queries, please contact us.</div>
      <div class="contact-info">📞 +91 1234567890 | ✉️ info@pgmanagement.com</div>
    </div>
  </div>
</body>
</html>
    `.trim();
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
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      console.error('Error sending via WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Download and share receipt
   */
  static async downloadAndShare(data: ReceiptData): Promise<void> {
    try {
      const html = this.generateReceiptHTML(data);
      const fileName = `Receipt_${data.receiptNumber}.html`;
      const fileUri = (FileSystem.documentDirectory || '') + fileName;

      await FileSystem.writeAsStringAsync(fileUri, html);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'Share Receipt',
        });
      } else {
        Alert.alert('Success', `Receipt saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      throw error;
    }
  }

  /**
   * Download receipt only
   */
  static async downloadReceipt(data: ReceiptData): Promise<string> {
    try {
      const html = this.generateReceiptHTML(data);
      const fileName = `Receipt_${data.receiptNumber}.html`;
      const fileUri = (FileSystem.documentDirectory || '') + fileName;

      await FileSystem.writeAsStringAsync(fileUri, html);
      return fileUri;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  }
}
