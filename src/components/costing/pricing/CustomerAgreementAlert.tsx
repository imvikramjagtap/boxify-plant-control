import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";
import { CustomerPricingAgreement } from "@/store/slices/quotationManagementSlice";

interface CustomerAgreementAlertProps {
  customerAgreement: CustomerPricingAgreement;
}

export default function CustomerAgreementAlert({ customerAgreement }: CustomerAgreementAlertProps) {
  return (
    <Alert>
      <Users className="h-4 w-4" />
      <AlertDescription>
        Active customer agreement: <strong>{customerAgreement.agreementName}</strong>
        <br />
        Valid: {new Date(customerAgreement.validFrom).toLocaleDateString()} - {new Date(customerAgreement.validTo).toLocaleDateString()}
      </AlertDescription>
    </Alert>
  );
}