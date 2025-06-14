import { PurchaseOrder, POItem } from "@/store/types";

export const generatePONumber = (supplierId: string, date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `PO-${year}${month}-${random}`;
};

export const validatePOItem = (item: POItem): boolean => {
  return !!(
    item.materialId &&
    item.quantity > 0 &&
    item.rate > 0 &&
    item.unit
  );
};

export const calculateItemGST = (amount: number, gstRate: number = 18): number => {
  return amount * (gstRate / 100);
};

export const calculateTDS = (amount: number, tdsRate: number = 2): number => {
  return amount * (tdsRate / 100);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const generatePOEmail = (po: PurchaseOrder): string => {
  return `
Subject: Purchase Order ${po.id} - ${po.supplier.name}

Dear ${po.supplier.contactPersons[0]?.name || 'Sir/Madam'},

Please find attached Purchase Order ${po.id} for the materials as per the details below:

Purchase Order Details:
- PO Number: ${po.id}
- Date: ${new Date(po.date).toLocaleDateString('en-IN')}
- Expected Delivery: ${new Date(po.expectedDelivery).toLocaleDateString('en-IN')}
- Total Amount: ${formatCurrency(po.totalAmount)}

Items:
${po.items.map(item => 
  `- ${item.materialName}: ${item.quantity} ${item.unit} @ ${formatCurrency(item.rate)} = ${formatCurrency(item.total)}`
).join('\n')}

Payment Terms:
- Method: ${po.paymentTerms.paymentMethod.toUpperCase()}
- Credit Period: ${po.paymentTerms.creditDays} days
${po.paymentTerms.advancePercentage > 0 ? `- Advance Required: ${po.paymentTerms.advancePercentage}%` : ''}

Delivery Address:
${po.deliveryDetails.deliveryAddress}
Contact: ${po.deliveryDetails.contactPerson} (${po.deliveryDetails.contactPhone})

Please acknowledge receipt of this order and confirm the delivery schedule.

Best regards,
${po.requestedBy}
  `.trim();
};

export const getSpecificationsSummary = (item: POItem): string => {
  if (!item.specifications) return '';
  
  const specs = [];
  if (item.specifications.gsm) specs.push(`GSM: ${item.specifications.gsm}`);
  if (item.specifications.bf) specs.push(`BF: ${item.specifications.bf}`);
  if (item.specifications.ect) specs.push(`ECT: ${item.specifications.ect}`);
  if (item.specifications.fluteType) specs.push(`Flute: ${item.specifications.fluteType}`);
  if (item.specifications.grade) specs.push(`Grade: ${item.specifications.grade}`);
  
  return specs.join(' | ');
};

export const validatePO = (po: Partial<PurchaseOrder>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!po.supplier) errors.push('Supplier is required');
  if (!po.expectedDelivery) errors.push('Expected delivery date is required');
  if (!po.items || po.items.length === 0) errors.push('At least one item is required');
  
  if (po.items) {
    po.items.forEach((item, index) => {
      if (!validatePOItem(item)) {
        errors.push(`Item ${index + 1} has invalid data`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};