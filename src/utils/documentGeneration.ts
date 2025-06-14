import { CostingProject } from '@/store/types';
import { AdvancedPricingOutput } from './advancedPricingEngine';

export interface QuotationDocument {
  id: string;
  quotationNumber: string;
  date: string;
  validityDate: string;
  client: {
    name: string;
    address: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  items: {
    description: string;
    specifications: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  taxes: {
    gstRate: number;
    gstAmount: number;
  };
  grandTotal: number;
  termsAndConditions: string[];
  paymentTerms: string;
  deliveryTerms: string;
  notes?: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  attachments: string[];
}

export function generateQuotationDocument(
  costingProject: CostingProject,
  clientData: any,
  pricingData: AdvancedPricingOutput
): QuotationDocument {
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + pricingData.recommendedValidityDays);

  return {
    id: `DOC-${costingProject.id}`,
    quotationNumber: costingProject.quotationId,
    date: costingProject.quotationDetails.quotationDate,
    validityDate: validityDate.toISOString().split('T')[0],
    client: {
      name: clientData?.name || 'Unknown Client',
      address: clientData?.address || '',
      contactPerson: clientData?.contactPersons?.[0]?.name || '',
      email: clientData?.email || '',
      phone: clientData?.phone || '',
    },
    items: [
      {
        description: costingProject.boxName,
        specifications: `Dimensions: Custom Box\nQuantity: ${costingProject.quantity.toLocaleString()} pieces`,
        quantity: costingProject.quantity,
        unitPrice: pricingData.pricePerUnit,
        totalPrice: pricingData.finalPrice,
      }
    ],
    subtotal: pricingData.finalPrice,
    taxes: {
      gstRate: 18,
      gstAmount: pricingData.finalPrice * 0.18,
    },
    grandTotal: pricingData.finalPrice * 1.18,
    termsAndConditions: [
      'Prices are valid for ' + pricingData.recommendedValidityDays + ' days from the date of quotation',
      'Payment terms: Net 30 days from delivery',
      'Delivery: Ex-works, transportation extra',
      'GST as applicable',
      ...(pricingData.escalationClause ? [pricingData.escalationClause] : []),
    ],
    paymentTerms: costingProject.quotationDetails.paymentTerms,
    deliveryTerms: costingProject.quotationDetails.deliveryTerms,
    notes: costingProject.quotationDetails.notes,
  };
}

export function generateQuotationHTML(doc: QuotationDocument): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Quotation - ${doc.quotationNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .quotation-title { font-size: 20px; margin: 10px 0; }
        .client-info { margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .info-box h3 { margin: 0 0 10px 0; font-size: 16px; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .text-right { text-align: right; }
        .total-row { background-color: #f8f9fa; font-weight: bold; }
        .terms { margin-top: 30px; }
        .terms h3 { color: #2563eb; }
        .terms ul { padding-left: 20px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-logo">Box Manufacturing Company</div>
        <div class="quotation-title">QUOTATION</div>
        <div>Quotation No: ${doc.quotationNumber}</div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <h3>Bill To:</h3>
          <div><strong>${doc.client.name}</strong></div>
          <div>${doc.client.address}</div>
          <div>Contact: ${doc.client.contactPerson}</div>
          <div>Email: ${doc.client.email}</div>
          <div>Phone: ${doc.client.phone}</div>
        </div>
        <div class="info-box">
          <h3>Quotation Details:</h3>
          <div><strong>Date:</strong> ${new Date(doc.date).toLocaleDateString()}</div>
          <div><strong>Valid Until:</strong> ${new Date(doc.validityDate).toLocaleDateString()}</div>
          <div><strong>Payment Terms:</strong> ${doc.paymentTerms}</div>
          <div><strong>Delivery Terms:</strong> ${doc.deliveryTerms}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Specifications</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Unit Price (₹)</th>
            <th class="text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${doc.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.specifications.replace(/\n/g, '<br>')}</td>
              <td class="text-right">${item.quantity.toLocaleString()}</td>
              <td class="text-right">${item.unitPrice.toFixed(2)}</td>
              <td class="text-right">${item.totalPrice.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="text-right"><strong>Subtotal:</strong></td>
            <td class="text-right"><strong>₹${doc.subtotal.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td colspan="4" class="text-right">GST (${doc.taxes.gstRate}%):</td>
            <td class="text-right">₹${doc.taxes.gstAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4" class="text-right"><strong>Grand Total:</strong></td>
            <td class="text-right"><strong>₹${doc.grandTotal.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <div class="terms">
        <h3>Terms & Conditions:</h3>
        <ul>
          ${doc.termsAndConditions.map(term => `<li>${term}</li>`).join('')}
        </ul>
      </div>

      ${doc.notes ? `
        <div class="terms">
          <h3>Additional Notes:</h3>
          <p>${doc.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a system-generated quotation.</p>
      </div>
    </body>
    </html>
  `;
}

export function generateEmailTemplate(
  type: 'new_quotation' | 'quotation_revision' | 'quotation_reminder',
  doc: QuotationDocument,
  customMessage?: string
): EmailTemplate {
  const templates = {
    new_quotation: {
      subject: `Quotation ${doc.quotationNumber} - ${doc.client.name}`,
      body: `Dear ${doc.client.contactPerson || doc.client.name},

Thank you for your inquiry. Please find attached our quotation for your packaging requirements.

Quotation Details:
- Quotation Number: ${doc.quotationNumber}
- Date: ${new Date(doc.date).toLocaleDateString()}
- Valid Until: ${new Date(doc.validityDate).toLocaleDateString()}
- Total Amount: ₹${doc.grandTotal.toLocaleString()}

${customMessage || ''}

Key highlights of our quotation:
- Competitive pricing with quality assurance
- Timely delivery as per your requirements
- Comprehensive packaging solutions

Please review the attached quotation and feel free to contact us for any clarifications or negotiations.

We look forward to your favorable response.

Best regards,
Sales Team
Box Manufacturing Company`,
      attachments: [`quotation_${doc.quotationNumber}.pdf`]
    },
    quotation_revision: {
      subject: `Revised Quotation ${doc.quotationNumber} - ${doc.client.name}`,
      body: `Dear ${doc.client.contactPerson || doc.client.name},

Please find attached the revised quotation as per our recent discussions.

Revised Quotation Details:
- Quotation Number: ${doc.quotationNumber}
- Revision Date: ${new Date().toLocaleDateString()}
- Valid Until: ${new Date(doc.validityDate).toLocaleDateString()}
- Total Amount: ₹${doc.grandTotal.toLocaleString()}

${customMessage || 'Changes have been made based on your feedback and requirements.'}

Please review the revised quotation and let us know if this meets your expectations.

Best regards,
Sales Team
Box Manufacturing Company`,
      attachments: [`quotation_${doc.quotationNumber}_revised.pdf`]
    },
    quotation_reminder: {
      subject: `Reminder: Quotation ${doc.quotationNumber} - Valid Until ${new Date(doc.validityDate).toLocaleDateString()}`,
      body: `Dear ${doc.client.contactPerson || doc.client.name},

This is a gentle reminder regarding our quotation ${doc.quotationNumber} which is valid until ${new Date(doc.validityDate).toLocaleDateString()}.

Quotation Summary:
- Total Amount: ₹${doc.grandTotal.toLocaleString()}
- Validity: ${new Date(doc.validityDate).toLocaleDateString()}

${customMessage || 'We would appreciate your decision at the earliest to proceed with your order.'}

If you need any clarifications or would like to discuss the quotation further, please feel free to contact us.

Best regards,
Sales Team
Box Manufacturing Company`,
      attachments: [`quotation_${doc.quotationNumber}.pdf`]
    }
  };

  return templates[type];
}