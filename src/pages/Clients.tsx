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
import { Plus, Search, Settings, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addClient, updateClient, selectAllClients } from "@/store/slices/clientsSlice";

const industryTypes = [
  "Dairy",
  "Automobile", 
  "Pharma",
  "Liquor",
  "Electronics",
  "Food & Beverage",
  "Cosmetics",
  "Textiles",
  "E-commerce"
];

export default function Clients() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  
  // Get clients from Redux store
  const clients = useAppSelector((state: any) => state.clients?.clients || []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
    productType: "",
    industryType: "",
    state: "",
    address: "",
    pinCode: "",
    contactPersons: [{ name: "", phone: "" }],
    associatedItems: [""]
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.productType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === "all" || client.industryType === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setEditingClient(client);
        setFormData({
          name: client.name,
          email: client.email,
          phone: client.phone,
          gstNumber: client.gstNumber,
          productType: client.productType,
          industryType: client.industryType,
          state: client.state,
          address: client.address,
          pinCode: client.pinCode,
          contactPersons: client.contactPersons,
          associatedItems: client.associatedItems?.length > 0 ? client.associatedItems : [""]
        });
        setIsDialogOpen(true);
      }
    }
  }, [clientId, clients]);

  const handleSubmit = () => {
    if (editingClient) {
      // Update existing client
      dispatch(updateClient({
        id: editingClient.id,
        updates: {
          ...formData,
          associatedItems: formData.associatedItems.filter(item => item.trim() !== "")
        }
      }));
      
      toast({
        title: "Client Updated",
        description: "Client has been successfully updated.",
      });
    } else {
      // Add new client
      dispatch(addClient({
        ...formData,
        city: formData.state, // Using state as city for now
        associatedItems: formData.associatedItems.filter(item => item.trim() !== ""),
        status: "Active"
      }));
      
      toast({
        title: "Client Added",
        description: "New client has been successfully added to the system.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      gstNumber: "",
      productType: "",
      industryType: "",
      state: "",
      address: "",
      pinCode: "",
      contactPersons: [{ name: "", phone: "" }],
      associatedItems: [""]
    });
    
    if (clientId) {
      navigate('/clients');
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

  const addAssociatedItem = () => {
    setFormData({
      ...formData,
      associatedItems: [...formData.associatedItems, ""]
    });
  };

  const removeAssociatedItem = (index: number) => {
    const updatedItems = formData.associatedItems.filter((_, i) => i !== index);
    setFormData({ ...formData, associatedItems: updatedItems });
  };

  const updateAssociatedItem = (index: number, value: string) => {
    const updatedItems = formData.associatedItems.map((item, i) =>
      i === index ? value : item
    );
    setFormData({ ...formData, associatedItems: updatedItems });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Master</h1>
          <p className="text-muted-foreground">
            Manage your client database and associated products
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter client name"
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
                  <Input
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    placeholder="Enter product type"
                  />
                </div>
                <div>
                  <Label htmlFor="industryType">Industry Type</Label>
                  <Select
                    value={formData.industryType}
                    onValueChange={(value) => setFormData({ ...formData, industryType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryTypes.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Associated Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAssociatedItem}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                {formData.associatedItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter item/product name"
                      value={item}
                      onChange={(e) => updateAssociatedItem(index, e.target.value)}
                    />
                    {formData.associatedItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAssociatedItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingClient(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  gstNumber: "",
                  productType: "",
                  industryType: "",
                  state: "",
                  address: "",
                  pinCode: "",
                  contactPersons: [{ name: "", phone: "" }],
                  associatedItems: [""]
                });
                if (clientId) {
                  navigate('/clients');
                }
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingClient ? 'Update Client' : 'Add Client'}
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
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by industry" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            <SelectItem value="all">All Industries</SelectItem>
            {industryTypes.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No clients found</h3>
            <p className="text-muted-foreground">
              {searchTerm || industryFilter !== "all" 
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first client"
              }
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.id}</p>
                </div>
                <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                  {client.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Product Type</p>
                <p className="text-sm text-muted-foreground">{client.productType}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Industry Type</p>
                <p className="text-sm text-muted-foreground">{client.industryType}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Contact</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{client.state} - {client.pinCode}</p>
              </div>

              <div>
                <p className="text-sm font-medium">GST Number</p>
                <p className="text-sm text-muted-foreground">{client.gstNumber}</p>
              </div>

              {client.contactPersons.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Contact Persons</p>
                  {client.contactPersons.map((contact, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {contact.name} - {contact.phone}
                    </p>
                  ))}
                </div>
              )}

              {client.associatedItems?.length > 0 && (
                <div>
                  <p className="text-sm font-medium flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    Associated Items ({client.associatedItems?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(client.associatedItems || []).slice(0, 3).map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {(client.associatedItems?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(client.associatedItems?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/clients/${client.id}`)}
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