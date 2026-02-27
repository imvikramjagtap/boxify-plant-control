import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Warehouse, 
  Truck, 
  ArrowRightLeft, 
  PackageCheck, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  User, 
  Star,
  Settings2,
  MoreVertical
} from "lucide-react";
import { 
  selectAllLocations, 
  selectAllJobWorkers, 
  addLocation, 
  addJobWorker 
} from "@/store/slices/godownJobWorkerSlice";
import { toast } from "sonner";

export default function GodownJobWorker() {
  const dispatch = useDispatch();
  const locations = useSelector(selectAllLocations);
  const jobWorkers = useSelector(selectAllJobWorkers);
  const [activeTab, setActiveTab] = useState("locations");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLoc = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      type: formData.get("type") as any,
      capacity: Number(formData.get("capacity")),
      currentUsage: 0,
      contactPerson: formData.get("contactPerson") as string,
      phone: formData.get("phone") as string,
      status: "Active" as const,
    };
    dispatch(addLocation(newLoc));
    toast.success("Location added successfully");
  };

  const handleAddJW = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newJW = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      gstNumber: formData.get("gstNumber") as string,
      specialization: (formData.get("specialization") as string).split(",").map(s => s.trim()),
      ratePerUnit: Number(formData.get("rate")),
      rating: 5,
      status: "Active" as const,
      activeJobCards: 0,
    };
    dispatch(addJobWorker(newJW));
    toast.success("Job Worker added successfully");
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJW = jobWorkers.filter(jw => 
    jw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jw.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Godown & Job Worker Master</h1>
          <p className="text-muted-foreground mt-1">
            Manage storage locations and external processing partners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === "locations" ? "Add Godown" : "Add Job Worker"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{activeTab === "locations" ? "Add New Godown" : "Add New Job Worker"}</DialogTitle>
              </DialogHeader>
              {activeTab === "locations" ? (
                <form onSubmit={handleAddLocation} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Godown Name</Label>
                    <Input id="name" name="name" placeholder="Main Raw Material Godown" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue="inbound">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound / Raw Material</SelectItem>
                        <SelectItem value="outbound">Outbound / Finished Goods</SelectItem>
                        <SelectItem value="production">Production Floor</SelectItem>
                        <SelectItem value="scrap">Scrap Yard</SelectItem>
                        <SelectItem value="job_worker">Job Worker Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity (Units)</Label>
                    <Input id="capacity" name="capacity" type="number" placeholder="5000" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" placeholder="Sector 56, Industrial Estate" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input id="contactPerson" name="contactPerson" placeholder="Mr. Sharma" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="+91..." />
                    </div>
                  </div>
                  <Button type="submit">Save Godown</Button>
                </form>
              ) : (
                <form onSubmit={handleAddJW} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Job Worker Name</Label>
                    <Input id="name" name="name" placeholder="Super Print Solutions" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input id="gstNumber" name="gstNumber" placeholder="27AAAAA..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialization">Specializations (comma separated)</Label>
                    <Input id="specialization" name="specialization" placeholder="Printing, Die-Cutting" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rate">Base Rate (per unit)</Label>
                    <Input id="rate" name="rate" type="number" step="0.01" placeholder="2.50" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" placeholder="Gali No. 4, Anand Industrial Area" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" placeholder="+91..." required />
                  </div>
                  <Button type="submit">Register Job Worker</Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Godowns", desc: "Active locations", icon: Warehouse, count: locations.length },
          { title: "Active JW", desc: "Outsourced partners", icon: Truck, count: jobWorkers.length },
          { title: "Operational Cap.", desc: "Avg. utilization", icon: ArrowRightLeft, count: "64%" },
          { title: "Open Jobs", desc: "Across all JW", icon: PackageCheck, count: jobWorkers.reduce((acc, curr) => acc + curr.activeJobCards, 0) },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3 px-6">
          <Tabs defaultValue="locations" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-slate-100 p-1">
                <TabsTrigger value="locations" className="data-[state=active]:bg-white">
                  <Warehouse className="h-4 w-4 mr-2" />
                  Godown Locations
                </TabsTrigger>
                <TabsTrigger value="job-workers" className="data-[state=active]:bg-white">
                  <Truck className="h-4 w-4 mr-2" />
                  Job Workers
                </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 bg-slate-50 border-slate-200" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="locations" className="mt-6">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[200px]">Location Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.length > 0 ? filteredLocations.map((loc) => (
                      <TableRow key={loc.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-medium text-blue-900">{loc.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {loc.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {loc.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs">
                              <span>{loc.currentUsage} / {loc.capacity}</span>
                              <span className="font-semibold">{loc.capacity ? Math.round((loc.currentUsage! / loc.capacity) * 100) : 0}%</span>
                            </div>
                            <Progress 
                              value={loc.capacity ? (loc.currentUsage! / loc.capacity) * 100 : 0} 
                              className={`h-1.5 ${
                                loc.capacity && (loc.currentUsage! / loc.capacity) > 0.8 ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"
                              }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{loc.contactPerson}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {loc.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={loc.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-700"}>
                            {loc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No locations found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="job-workers" className="mt-6">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[250px]">Job Worker</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Active Jobs</TableHead>
                      <TableHead>Rate & Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJW.length > 0 ? filteredJW.map((jw) => (
                      <TableRow key={jw.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-medium text-blue-900">{jw.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {jw.phone}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">GST: {jw.gstNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {jw.specialization.map(s => (
                              <Badge key={s} variant="outline" className="text-[10px] py-0 px-1.5 h-auto border-blue-100 text-blue-700 bg-blue-50/50">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-600">{jw.activeJobCards}</span>
                            <span className="text-xs text-muted-foreground">Active Cards</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">₹{jw.ratePerUnit}/unit</div>
                          <div className="flex items-center text-yellow-500 text-xs mt-1">
                            <Star className="h-3 w-3 fill-current mr-0.5" />
                            <span className="font-bold">{jw.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={jw.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-700"}>
                            {jw.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No job workers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
