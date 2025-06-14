import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateVersionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateVersion: (changes: string) => void;
  currentPrice: number;
  quantity: number;
}

export default function CreateVersionDialog({ 
  open, 
  onClose, 
  onCreateVersion, 
  currentPrice, 
  quantity 
}: CreateVersionDialogProps) {
  const [changes, setChanges] = useState("");
  const { toast } = useToast();

  const handleCreate = () => {
    if (!changes.trim()) {
      toast({
        title: "Changes Required",
        description: "Please describe the changes made in this version.",
        variant: "destructive",
      });
      return;
    }

    onCreateVersion(changes);
    setChanges("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Quote Version</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Price</Label>
              <Input value={`₹${currentPrice.toFixed(2)}`} readOnly />
            </div>
            <div>
              <Label>Price per Unit</Label>
              <Input value={`₹${(currentPrice / quantity).toFixed(2)}`} readOnly />
            </div>
          </div>
          
          <div>
            <Label htmlFor="changes">Changes Made (one per line) *</Label>
            <Textarea
              id="changes"
              placeholder="Updated pricing based on material cost changes&#10;Adjusted delivery timeline&#10;Modified specifications"
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Version
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}