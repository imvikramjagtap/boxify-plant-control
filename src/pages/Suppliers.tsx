import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Settings, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productTypes = [
  "Corrugated Sheets",
  "Adhesive & Glue", 
  "Stitching Wire",
  "Printing Ink",
  "Packaging Material"
];

interface ContactPerson {
  name: string;
  phone: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
  productType: string;
  state: string;
  address: string;
  pinCode: string;
  contactPersons: ContactPerson[];
  status: "Active" | "Inactive";
}

export default function Suppliers() {
  const { toast } = useToast();
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "SUP001",
      name: "Paper Mills Pvt Ltd",
      email: "info@papermills.com",
      phone: "+91 9876543210",
      gstNumber: "27AAAAA0000A1Z5",
      productType: "Corrugated Sheets",
      state: "Maharashtra",
      address: "123 Industrial Area, Mumbai",
      pinCode: "400001",
      contactPersons: [
        { name: "Rajesh Kumar", phone: "+91 9876543211" },
        { name: "Priya Sharma", phone: "+91 9876543212" }
      ],
      status: "Active"
    },
    {
      id: "SUP002", 
      name: "Adhesive Solutions",
      email: "sales@adhesive.com",
      phone: "+91 9876543213",
      gstNumber: "29BBBBB0000B1Z5",
      productType: "Adhesive & Glue",
      state: "Karnataka",
      address: "456 Chemical Complex, Bangalore",
      pinCode: "560001",
      contactPersons: [
        { name: "Amit Patel", phone: "+91 9876543214" }
      ],
      status: "Active"
    }
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
    productType: "",
    state: "",
    address: "",
    pinCode: "",
    contactPersons: [{ name: "", phone: "" }]
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = productFilter === "all" || supplier.productType === productFilter;
    return matchesSearch && matchesProduct;
  });

  useEffect(() => {
    if (supplierId) {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (supplier) {
        setEditingSupplier(supplier);
        setFormData({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          gstNumber: supplier.gstNumber,
          productType: supplier.productType,
          state: supplier.state,
          address: supplier.address,
          pinCode: supplier.pinCode,
          contactPersons: supplier.contactPersons
        });
        setIsDialogOpen(true);
      }
    }
  }, [supplierId, suppliers]);

  const handleSubmit = () => {
    if (editingSupplier) {
      // Update existing supplier
      const updatedSuppliers = suppliers.map(supplier =>
        supplier.id === editingSupplier.id
          ? { ...supplier, ...formData }
          : supplier
      );
      setSuppliers(updatedSuppliers);
      
      toast({
        title: "Supplier Updated",
        description: "Supplier has been successfully updated.",
      });
    } else {
      // Add new supplier
      const newSupplier: Supplier = {
        id: `SUP${String(suppliers.length + 1).padStart(3, '0')}`,
        ...formData,
        status: "Active"
      };
      
      setSuppliers([...suppliers, newSupplier]);
      
      toast({
        title: "Supplier Added",
        description: "New supplier has been successfully added to the system.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingSupplier(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      gstNumber: "",
      productType: "",
      state: "",
      address: "",
      pinCode: "",
      contactPersons: [{ name: "", phone: "" }]
    });
    
    if (supplierId) {
      navigate('/suppliers');
    }
  };

  const addContactPerson = () => {
    setFormData({
      ...formData,
      contactPersons: [...formData.contactPersons, { name: "", phone: "" }]
    });
  };

  const removeContactPerson = (index: number) => {
    const updatedContacts = formData.contactPersons.filter((_, i) => i !== index);
    setFormData({ ...formData, contactPersons: updatedContacts });
  };

  const updateContactPerson = (index: number, field: 'name' | 'phone', value: string) => {
    const updatedContacts = formData.contactPersons.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    );
    setFormData({ ...formData, contactPersons: updatedContacts });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supplier Master</h1>
          <p className="text-muted-foreground">
            Manage your supplier database and contact information
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="Enter GST number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => setFormData({ ...formData, productType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter complete address"
                />
              </div>

              <div>
                <Label htmlFor="pinCode">Pin Code</Label>
                <Input
                  id="pinCode"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  placeholder="Enter pin code"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Contact Persons</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addContactPerson}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Contact
                  </Button>
                </div>
                {formData.contactPersons.map((contact, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Contact person name"
                      value={contact.name}
                      onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Phone number"
                        value={contact.phone}
                        onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                      />
                      {formData.contactPersons.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeContactPerson(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingSupplier(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  gstNumber: "",
                  productType: "",
                  state: "",
                  address: "",
                  pinCode: "",
                  contactPersons: [{ name: "", phone: "" }]
                });
                if (supplierId) {
                  navigate('/suppliers');
                }
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            <SelectItem value="all">All Products</SelectItem>
            {productTypes.map((product) => (
              <SelectItem key={product} value={product}>
                {product}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Truck className="h-16 w-16 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No suppliers found</h3>
            <p className="text-muted-foreground">
              {searchTerm || productFilter !== "all" 
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first supplier"
              }
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{supplier.id}</p>
                  </div>
                  <Badge variant={supplier.status === "Active" ? "default" : "secondary"}>
                    {supplier.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Product Type</p>
                  <p className="text-sm text-muted-foreground">{supplier.productType}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{supplier.email}</p>
                  <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{supplier.state} - {supplier.pinCode}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">GST Number</p>
                  <p className="text-sm text-muted-foreground">{supplier.gstNumber}</p>
                </div>

                {supplier.contactPersons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Contact Persons</p>
                    {supplier.contactPersons.map((contact, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {contact.name} - {contact.phone}
                      </p>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/suppliers/${supplier.id}`)}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}