# BoxMaster Pro — System Documentation

> Complete operational guide for the BoxMaster Pro Plant Control System.  
> This document covers every module, how data flows between them, what depends on what, and how calculations work.

---

## 1. High-Level Data Flow

The system follows a linear production pipeline:

**Master Setup → Costing → Quotation → Sales Order → Job Card → Production → Delivery → Reports**

Each step feeds into the next. You cannot skip ahead — for example, you cannot create a Job Card without a confirmed Sales Order, and you cannot dispatch goods without a completed production job.

---

## 2. Getting Started (Quick Start Checklist)

If you're setting up the system for the first time, follow this order:

1. ✅ **Register Suppliers** — Go to My MASTER → Suppliers → Add your paper / raw material vendors
2. ✅ **Add Raw Materials** — Go to My MASTER → Raw Material → Add paper types (Kraft, Test Liner, etc.) with GSM, BF, and rate
3. ✅ **Add Clients** — Go to My MASTER → Client → Add your customers with GST and contact details
4. ✅ **Add Job Workers** — Go to My MASTER → Godown/JW → Add your corrugation / printing job workers
5. ✅ **Create a Box Design** — Go to Box Designs → Add New → Fill in ply, dimensions, paper specs
6. ✅ **Create a Quotation** — Go to Quotation → New Quote → Select box + client → Set rates → Save
7. ✅ **Accept a Sales Order** — Go to Sales → Sales Orders → Create from approved quotation
8. ✅ **Generate Job Cards** — Go to WIP → Job Cards → Generate from confirmed Sales Order
9. ✅ **Record Production** — Track material issue, inward, and dispatch

> **Tip:** You can access this Help page anytime from the **System Help** button in the top-right corner of the app.

---

## 3. Dashboard

The Dashboard is the **home page** of the system. It provides an at-a-glance overview:

- **Summary Cards** — Active orders, pending deliveries, stock alerts, revenue
- **Recent Activity** — Latest quotations, orders, and job cards
- **Quick Actions** — Shortcuts to create new items

> The Dashboard pulls live data from all modules. It's read-only — you manage data through the individual modules.

---

## 4. Module Breakdown

### 4.1 My MASTER (Foundation Data)

These are the building blocks of the entire system. **Everything else depends on these being set up first.**

| Master | What It Stores | Why It Matters |
|--------|---------------|----------------|
| **Supplier** | Name, GST, contact, bank details | Required to create Purchase Orders |
| **Client** | Company name, address, GST, contact person | Required for Quotations and Sales Orders |
| **Raw Material** | Paper type, GSM, current stock, rate per unit, reorder level | Used in Costing calculations and stock tracking |
| **Godown / Job Worker** | Worker name, location, specialization, capacity | Required when generating Job Cards |

> **Rule:** You must have at least one Supplier and one Raw Material before you can create a Purchase Order. You must have at least one Client before you can send a Quotation.

---

### 4.2 Box Master

#### Box Master Card
The Box Master Card stores the **complete specification** of a box design. It is the starting point for everything.

**What you fill in:**
- **Box Name** and **Item Code** — how you identify this design
- **Client** — who this box is for (from the Client Master)
- **Ply** — 3 Ply, 5 Ply, or 7 Ply corrugation
- **Box Type** — RSC, Top & Bottom, Export Tray, Telescopic, etc.
- **Dimensions** — Inner Length × Width × Height (mm)
- **Flute Type** — A, B, C, E (for 3 Ply) or combinations like AB, BC (for 5/7 Ply)
- **Paper Specifications** — GSM and BF for each layer (Top, Flute, Base)
- **Manufacturing Joint** — Stitching Pin (with pin count) or Glue
- **Printing** — Enable/disable, number of colours, printing type (Flexo/Offset/Digital), colour codes
- **Stacking Strength** — Content Weight, Stack Height, Safety Factor

**Auto-calculated fields:**
- **Outer Dimensions** = Inner + 5mm each side
- **Sheet Size** (Deckle/Cutting) = `Deckle = H + W + 25`, `Cutting = (L + W) × 2 + 60`
- **Sheet Size for 2 Up / 3 Up / 4 Up** — multiples of deckle
- **Ply Weight** — For flat layers: `(Deckle × Cutting × GSM) / 100000`; For flute layers: `GSM + (GSM × Flute%)`
- **Ply B.S.** — For flat layers: `(GSM × BF) / 1000`; For flute layers: `(BF × 50) / 1000`
- **Total Box Weight** — Sum of all ply weights
- **Bursting Strength of Box** — Sum of all ply B.S.
- **Load on Bottom Box** = Content Weight × (Stack Height − 1)
- **Compression Strength** = Load on Bottom Box × Safety Factor

> **Rule:** You must have at least one Client registered before creating a box. The box data is stored via Redux with localStorage persistence.

#### Costing
The costing module is the **calculation engine** of the system. It determines the cost of manufacturing one box.

**How to create a Costing / Quotation:**
1. Go to **Quotation page** → Click **"New Quote"** (auto-generates a Quotation ID and opens the Costing form)
2. Or go to **Costing page** → Click **"Add Costing"** and enter a Quotation ID manually
3. Select the **Box** (from Box Master) and **Client**
4. Set the **Rates**: JW Rate, Sheet Inward, Box Making, Printing, Accessories, ROI %, Carriage Outward
5. The system auto-calculates all costs and shows the **Cost Breakdown table**
6. Click **"Save & Generate Quotation"** — this creates the costing record AND makes it visible on the Quotation page

**Costing Formula:**
```
JW Charges = (Box Weight × JW Rate) / 1000
Sheet Inward = Box Weight × Sheet Inward Rate
Box Making = Rate per box (fixed)
Printing = Rate per box (fixed)
Accessories = Box Weight × Accessories Rate
Mfg Cost = JW + Sheet Inward + Box Making + Printing + Accessories
ROI = Mfg Cost × ROI%
Total Cost Per Box = Mfg Cost + ROI + Carriage Outward
Total Price = Cost Per Box × Quantity
```

> **Rule:** Costing requires a Box from Box Master (which determines the weight) and a Client. The Box Weight used in calculations comes from the Paper Specifications set in the Box Master Card.

#### Quotation
The Quotation page shows all generated quotations (Costing records that have a Quotation ID).

**Quotation Statuses:**
- `Sent` → Waiting for client response
- `Approved` → Client accepted the price (click ✓ to approve)
- `Rejected` → Client declined
- `Converted to SO` → Successfully turned into a Sales Order (click "Convert to SO")

**Workflow:**
```
New Quote → Costing Form → Save → Appears on Quotation Page → Approve → Convert to Sales Order
```

> **Rule:** A Quotation is created through the Costing page. The "New Quote" button on the Quotation page navigates you to the Costing form with an auto-generated Quotation ID. Converting to SO freezes the pricing — future rate changes won't affect this order.

#### Material Trends (Costing Tool)
When creating or editing a Costing, you can click the **"📈 Material Trends"** button in the top-right of the form header. This opens a dialog showing:

- **Current vs Previous prices** for each raw material used in the selected box
- **Price Trend** — Increasing ↗, Decreasing ↘, or Stable →
- **Volatility Index** — Low / Medium / High based on price history
- **Cost Impact** — How much each material contributes to the total cost
- **Cost Adjustment** — Suggested adjustment based on market movement

> **Tip:** Use this before finalizing a quotation to check if raw material prices have changed significantly. Consider adding a price escalation clause for high-volatility materials.

---

### 4.3 Purchase (Procurement)

#### Generate Purchase Order (PO)
When raw materials are running low, you create a PO to order from a supplier.

**What you specify:**
- Supplier (from Master)
- Material (from Raw Material Master)
- Quantity and agreed rate
- Expected delivery date

> **Rule:** A PO requires a registered Supplier and a registered Raw Material.

#### Purchase Inward Entry
When the ordered material physically arrives at your factory gate, you record a Purchase Inward.

**What happens automatically:**
- The **Raw Material stock** increases by the received quantity.
- The **average purchase rate** is recalculated using weighted average:
  ```
  New Avg Rate = (Old Stock × Old Rate + New Qty × New Rate) / (Old Stock + New Qty)
  ```
- The PO status updates to reflect partial or full receipt.

> **Rule:** You can only record Inward against an existing Purchase Order. The received quantity cannot exceed the ordered quantity.

---

### 4.4 Work In Progress (WIP)

This is the production tracking section — the core of factory operations.

#### Generate Job Card for JW (Job Worker)
A Job Card is a **work order** that links a Sales Order to a Job Worker, telling them what to produce.

**Auto-calculated fields:**
- **Material Requirements**: Based on the Costing spec attached to the Sales Order.
  ```
  Required Material = (Weight per Box / (1 - Wastage%)) × Order Quantity
  ```
  Example: 1000 boxes, 0.5 kg/box, 10% wastage → `(0.5 / 0.90) × 1000 = 555.6 kg`
- **Expected completion date**: Based on the Sales Order delivery deadline.

**Job Card Statuses:**
- `Created` → Job card generated, materials not yet issued
- `Material Issued` → Raw material sent to Job Worker
- `In Progress` → Worker is processing the order
- `Completed` → Finished goods received back
- `Cancelled` → Job card voided

> **Rule:** You can only generate a Job Card from a **Confirmed** Sales Order. The Job Worker must exist in the Godown/JW Master.

#### JW Material Inward
When a Job Worker returns finished or semi-finished goods, you record them here.

**What you specify:**
- Job Card reference
- Quantity of finished goods received
- Any rejected/damaged quantity
- Date of receipt

**What happens:**
- The Job Card progress updates (e.g., 500 of 1000 boxes received).
- If the full quantity is received, the Job Card moves to `Completed`.
- The corresponding Sales Order can then move to `Ready to Ship`.

> **Rule:** You can only record Inward against an active (non-cancelled) Job Card. Received quantity + rejected quantity should account for all issued material.

#### JW Material Consumption
This is an **analysis module** — it doesn't create data, but reads and compares it.

**Key metrics:**
- **Yield %**: `(Finished Goods Weight / Issued Material Weight) × 100`
- **Wastage %**: `100 - Yield %`
- **Variance**: Difference between expected and actual consumption

This helps identify which Job Workers are efficient and which have abnormal wastage.

> **Rule:** Consumption data is derived from Job Cards that have both "Material Issued" and "Material Inward" records.

#### Job Card Analysis
Performance dashboard showing:
- **Worker Leaderboard**: Ranked by yield %, turnaround time, and rejection rate.
- **Turnaround Time (TAT)**: `Completion Date - Issue Date` for each job.
- **Deadline Monitoring**: Which jobs are overdue vs. on track.

> **Rule:** Analysis is read-only. Data comes from all Job Cards across all statuses.

#### RM Stock Consumption
For **in-house production** (not sent to external Job Workers). When you use raw material on your own factory floor, record it here to deduct stock.

**What happens:**
- Raw Material stock decreases by the consumed quantity.
- A stock movement record is created for audit trail.

> **Rule:** You must have sufficient stock of the Raw Material to record consumption. The system will warn if stock goes below the reorder level.

---

### 4.5 Sales

#### Sales Order Acceptance
When a client confirms a Quotation, it becomes a Sales Order (SO).

**Sales Order Lifecycle:**
```
Draft → Confirmed → In Production → Ready to Ship → Shipped → Delivered
```

Each status transition triggers different actions:
- `Confirmed` → Unlocks Job Card generation
- `In Production` → Production tracking begins  
- `Ready to Ship` → Unlocks Delivery/Dispatch
- `Shipped` → LR Number recorded, goods in transit
- `Delivered` → Order completed and closed

> **Rule:** Status can only move forward, never backward (except cancellation). A Sales Order can only be created from an Approved Quotation or manually by the Sales Manager.

#### Delivery & Dispatch
The logistics module for tracking physical shipments.

**What you record:**
- Sales Order reference
- Transporter name and vehicle number
- LR (Lorry Receipt) Number — this is the primary tracking identifier
- Number of packages / weight
- Dispatch date

**Shipment Statuses:**
- `In Transit` → Goods have left the factory
- `Delivered` → Client has confirmed receipt

> **Rule:** You can only create a shipment for orders in `Ready to Ship` status. Once a shipment is marked `Delivered`, the parent Sales Order automatically moves to `Delivered` status.

---

### 4.6 Reports & Analytics

All reports pull **live data** from the Redux store. They are read-only views.

| Report | Data Source | What It Shows |
|--------|-----------|---------------|
| **Purchase Report** | Purchase Orders + Purchase Inward | Total procurement spend, supplier-wise breakdown, PO status |
| **Consumption Report** | Job Cards + Stock Movements | Material usage vs expected, yield analysis, wastage valuation |
| **Stock in Hand** | Raw Materials Master | Current inventory levels, valuation, items below reorder point |
| **Sales Report** | Sales Orders | Revenue by client, order volumes, conversion rates |
| **Pending Order Report** | Sales Orders (non-delivered) | Overdue orders, production bottlenecks, deadline tracking |

---

## 5. Dependency Chain (What Needs What)

```
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐
│  SUPPLIER       │───▶│ PURCHASE     │───▶│ STOCK        │
│  RAW MATERIAL   │    │ ORDER        │    │ UPDATE       │
└─────────────────┘    └──────────────┘    └──────┬───────┘
                                                  │
┌─────────────────┐    ┌──────────────┐           │
│  CLIENT         │───▶│ COSTING      │           │
│  RAW MATERIAL   │    │ (Box Spec)   │           │
└─────────────────┘    └──────┬───────┘           │
                              │                    │
                       ┌──────▼───────┐           │
                       │ QUOTATION    │           │
                       └──────┬───────┘           │
                              │                    │
                       ┌──────▼───────┐    ┌──────▼───────┐
                       │ SALES ORDER  │───▶│ JOB CARD     │
                       └──────┬───────┘    │ (Material    │
                              │            │  Issued)     │
                              │            └──────┬───────┘
                              │                   │
                       ┌──────▼───────┐    ┌──────▼───────┐
                       │ DELIVERY     │◀───│ JW INWARD    │
                       │ (Shipment)   │    │ (Finished    │
                       └──────────────┘    │  Goods)      │
                                           └──────────────┘
```

---

## 6. Quick Reference: System Rules

1. **No Supplier = No Purchase Order.** Always register suppliers first.
2. **No Raw Material = No Costing.** Paper rates must exist to calculate box cost.
3. **No Client = No Quotation.** You need someone to send the quote to.
4. **No Confirmed SO = No Job Card.** Production only starts after order confirmation.
5. **No Job Worker = No Job Card.** The system must know who will do the work.
6. **No Ready Order = No Shipment.** You cannot dispatch what isn't produced.
7. **Stock deductions are immediate.** When you record consumption, stock drops instantly.
8. **Rate changes don't affect old orders.** Costing snapshots are frozen at creation time.
9. **Status moves forward only.** Orders progress linearly through their lifecycle.
10. **Reports are always live.** They read current data, not cached snapshots.

---

## 7. User Roles & Responsibilities

| Role | Modules They Manage |
|------|---------------------|
| **Procurement Officer** | Suppliers, Purchase Orders, Purchase Inward |
| **Sales Manager** | Clients, Costing, Quotations, Sales Orders |
| **Production In-charge** | Job Cards, Material Issue, JW Inward, Stock Consumption |
| **Logistics Head** | Delivery, Shipments, LR Tracking |
| **Management / Admin** | Reports, Analytics, All Modules (read access) |

---

## 8. Data Storage & Persistence

All data in BoxMaster Pro is stored **locally in your browser** using Redux with localStorage persistence.

**What this means:**
- ✅ Data is saved automatically — no need to click "Save to Server"
- ✅ Data persists across page refreshes and browser restarts
- ⚠️ Data is **browser-specific** — if you switch browsers or clear browser data, your data will be lost
- ⚠️ This is a **single-user system** — data is not shared between different computers

> **Tip:** Regularly export important data (e.g., costing records, quotations) as a backup.
