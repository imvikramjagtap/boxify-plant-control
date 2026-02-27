# BoxMaster Pro — System Documentation

> Complete operational guide for the BoxMaster Pro Plant Control System.  
> This document covers every module, how data flows between them, what depends on what, and how calculations work.

---

## 1. High-Level Data Flow

The system follows a linear production pipeline:

**Master Setup → Costing → Quotation → Sales Order → Job Card → Production → Delivery → Reports**

Each step feeds into the next. You cannot skip ahead — for example, you cannot create a Job Card without a confirmed Sales Order, and you cannot dispatch goods without a completed production job.

---

## 2. Module Breakdown

### 2.1 My MASTER (Foundation Data)

These are the building blocks of the entire system. **Everything else depends on these being set up first.**

| Master | What It Stores | Why It Matters |
|--------|---------------|----------------|
| **Supplier** | Name, GST, contact, bank details | Required to create Purchase Orders |
| **Client** | Company name, address, GST, contact person | Required for Quotations and Sales Orders |
| **Raw Material** | Paper type, GSM, current stock, rate per unit, reorder level | Used in Costing calculations and stock tracking |
| **Godown / Job Worker** | Worker name, location, specialization, capacity | Required when generating Job Cards |

> **Rule:** You must have at least one Supplier and one Raw Material before you can create a Purchase Order. You must have at least one Client before you can send a Quotation.

---

### 2.2 Box Master

#### Costing
The costing module is the **calculation engine** of the system. It determines the cost of manufacturing one box.

**How costing is calculated:**
1. You specify the box dimensions (Length × Width × Height) and the type of corrugation (3-ply, 5-ply, 7-ply).
2. The system calculates the **total paper area** needed per box.
3. It multiplies this by the paper's **GSM (grams per square meter)** to get the net weight.
4. A **wastage factor** (typically 5–15%) is added on top. 
5. The weight is multiplied by the **paper rate (₹/kg)** to get raw material cost.
6. **Conversion cost** (labour, machine, power) and **profit margin** are added.

**Formula:**
```
Material Cost = (Paper Area × GSM / 1000) × (1 + Wastage%) × Rate per Kg
Total Cost = Material Cost + Conversion Cost + Overhead + Profit Margin
```

> **Rule:** Costing requires Raw Material rates to be set up in the Master. If rates change, existing costings are NOT affected — they use the rate at the time of creation.

#### Quotation
A formal price offer sent to a client, generated from a Costing project.

**Quotation Statuses:**
- `Sent` → Waiting for client response
- `Approved` → Client accepted the price
- `Rejected` → Client declined
- `Converted to SO` → Successfully turned into a Sales Order

> **Rule:** A Quotation can only be created from a completed Costing project. Converting to SO freezes the pricing — future rate changes won't affect this order.

---

### 2.3 Purchase (Procurement)

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

### 2.4 Work In Progress (WIP)

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

### 2.5 Sales

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

### 2.6 Reports & Analytics

All reports pull **live data** from the Redux store. They are read-only views.

| Report | Data Source | What It Shows |
|--------|-----------|---------------|
| **Purchase Report** | Purchase Orders + Purchase Inward | Total procurement spend, supplier-wise breakdown, PO status |
| **Consumption Report** | Job Cards + Stock Movements | Material usage vs expected, yield analysis, wastage valuation |
| **Stock in Hand** | Raw Materials Master | Current inventory levels, valuation, items below reorder point |
| **Sales Report** | Sales Orders | Revenue by client, order volumes, conversion rates |
| **Pending Order Report** | Sales Orders (non-delivered) | Overdue orders, production bottlenecks, deadline tracking |

---

## 3. Dependency Chain (What Needs What)

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

## 4. Quick Reference: System Rules

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

## 5. User Roles & Responsibilities

| Role | Modules They Manage |
|------|---------------------|
| **Procurement Officer** | Suppliers, Purchase Orders, Purchase Inward |
| **Sales Manager** | Clients, Costing, Quotations, Sales Orders |
| **Production In-charge** | Job Cards, Material Issue, JW Inward, Stock Consumption |
| **Logistics Head** | Delivery, Shipments, LR Tracking |
| **Management / Admin** | Reports, Analytics, All Modules (read access) |
