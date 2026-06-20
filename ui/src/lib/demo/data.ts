/**
 * In-memory demo dataset.
 *
 * THE TIME PROBLEM: every page defaults its selected date to "today" and asks
 * the API for that exact date. Real rows live on fixed calendar dates, so a
 * demo opened on an arbitrary day would show empty tables.
 *
 * THE WORKAROUND: nothing here stores an absolute date. The crop lifecycle is
 * expressed as day OFFSETS from an anchor that is computed as "today" when the
 * module loads. Plant / germinate / light-switch / harvest dates are derived
 * from those offsets at request time, so whatever day the demo is opened,
 * "today" always has data and the lifecycle chains stay internally consistent.
 */

// ----------------------------------------------------------------------------
// Date helpers (anchored on the day the demo is opened)
// ----------------------------------------------------------------------------

const ANCHOR = (() => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
})();

function iso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** ISO date string for ANCHOR + n days. */
export function dayOffset(n: number): string {
  return iso(new Date(ANCHOR.getFullYear(), ANCHOR.getMonth(), ANCHOR.getDate() + n));
}

// ----------------------------------------------------------------------------
// Types (kept local so this module is self-contained)
// ----------------------------------------------------------------------------

export interface Crop {
  crop_id: number;
  crop_name: string;
  seed_type: string;
  sow_rate: number;
  overnight_soak: boolean;
  days_direct_light: number;
  days_indirect_light: number;
  lead_time: number;
  rack_grow_days: number;
  yield_per_tray: number;
  germination_type: string;
}

export interface Product {
  product_id: number;
  crop_id: number;
  product_name: string;
  weight_grams: number;
  crop_ratio: number;
  crop_name: string;
  package_id: number;
  size_type: string;
  is_active: number;
}

export interface Packaging {
  package_id: number;
  size_type: string;
}

export interface Employee {
  employee_id: number;
  ssn: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  is_active: boolean;
  user_id?: number | null;
}

export interface Client {
  restaurant_id: number;
  restaurant_name: string;
  street_num: number | null;
  street_name: string;
  city: string;
  state: string;
  zip_code: string;
  is_active: boolean;
  contact_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  contact_name: string;
  contact_address: string;
}

export interface Delivery {
  delivery_date: string;
  delivery_status: string;
  employee_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface Order {
  order_id: number;
  restaurant_id: number;
  product_id: number;
  product_name: string;
  package_type: string;
  quantity: number;
  order_status: string;
  employee_id: number;
  delivery_date: string;
  is_forced: boolean;
}

/** A production lot used to derive the date-driven summaries. */
export interface Lot {
  crop: Crop;
  trays: number;
  harvestOffset: number;
}

// ----------------------------------------------------------------------------
// Static reference data
// ----------------------------------------------------------------------------

const CROPS: Crop[] = [
  { crop_id: 1, crop_name: "Sunflower", seed_type: "Black Oil", sow_rate: 120, overnight_soak: true, days_direct_light: 4, days_indirect_light: 4, lead_time: 1, rack_grow_days: 10, yield_per_tray: 14, germination_type: "weighted" },
  { crop_id: 2, crop_name: "Pea Shoots", seed_type: "Speckled Pea", sow_rate: 250, overnight_soak: true, days_direct_light: 3, days_indirect_light: 4, lead_time: 1, rack_grow_days: 9, yield_per_tray: 16, germination_type: "weighted" },
  { crop_id: 3, crop_name: "Radish", seed_type: "China Rose", sow_rate: 40, overnight_soak: false, days_direct_light: 3, days_indirect_light: 3, lead_time: 1, rack_grow_days: 7, yield_per_tray: 10, germination_type: "covered" },
  { crop_id: 4, crop_name: "Broccoli", seed_type: "Calabrese", sow_rate: 30, overnight_soak: false, days_direct_light: 4, days_indirect_light: 3, lead_time: 1, rack_grow_days: 8, yield_per_tray: 9, germination_type: "covered" },
  { crop_id: 5, crop_name: "Arugula", seed_type: "Astro", sow_rate: 25, overnight_soak: false, days_direct_light: 4, days_indirect_light: 4, lead_time: 1, rack_grow_days: 9, yield_per_tray: 8, germination_type: "covered" },
];

const PACKAGINGS: Packaging[] = [
  { package_id: 1, size_type: "Clamshell 4oz" },
  { package_id: 2, size_type: "Clamshell 8oz" },
  { package_id: 3, size_type: "Bag 2oz" },
  { package_id: 4, size_type: "Bulk Box 1lb" },
  { package_id: 5, size_type: "Live Tray" },
];

// Seven products spanning all five crops; Sunflower and Pea Shoots each offer a
// second package size (grouped by product_name in the packaging-options route).
const PRODUCTS: Product[] = [
  { product_id: 1, crop_id: 1, product_name: "Sunflower", weight_grams: 113, crop_ratio: 1, crop_name: "Sunflower", package_id: 1, size_type: "Clamshell 4oz", is_active: 1 },
  { product_id: 2, crop_id: 1, product_name: "Sunflower", weight_grams: 57, crop_ratio: 1, crop_name: "Sunflower", package_id: 3, size_type: "Bag 2oz", is_active: 1 },
  { product_id: 3, crop_id: 2, product_name: "Pea Shoots", weight_grams: 113, crop_ratio: 1, crop_name: "Pea Shoots", package_id: 1, size_type: "Clamshell 4oz", is_active: 1 },
  { product_id: 4, crop_id: 2, product_name: "Pea Shoots", weight_grams: 57, crop_ratio: 1, crop_name: "Pea Shoots", package_id: 3, size_type: "Bag 2oz", is_active: 1 },
  { product_id: 5, crop_id: 3, product_name: "Radish", weight_grams: 113, crop_ratio: 1, crop_name: "Radish", package_id: 1, size_type: "Clamshell 4oz", is_active: 1 },
  { product_id: 6, crop_id: 4, product_name: "Broccoli", weight_grams: 113, crop_ratio: 1, crop_name: "Broccoli", package_id: 1, size_type: "Clamshell 4oz", is_active: 1 },
  { product_id: 7, crop_id: 5, product_name: "Arugula", weight_grams: 113, crop_ratio: 1, crop_name: "Arugula", package_id: 2, size_type: "Clamshell 8oz", is_active: 1 },
];

const EMPLOYEES: Employee[] = [
  { employee_id: 1, ssn: "***-**-1001", first_name: "Maya", last_name: "Reyes", email: "maya@greenleaf.demo", title: "Grower", is_active: true, user_id: 1 },
  { employee_id: 2, ssn: "***-**-1002", first_name: "Liam", last_name: "Carter", email: "liam@greenleaf.demo", title: "Driver", is_active: true, user_id: null },
  { employee_id: 3, ssn: "***-**-1003", first_name: "Sofia", last_name: "Nguyen", email: "sofia@greenleaf.demo", title: "Driver", is_active: true, user_id: null },
  { employee_id: 4, ssn: "***-**-1004", first_name: "Noah", last_name: "Patel", email: "noah@greenleaf.demo", title: "Harvester", is_active: true, user_id: null },
  { employee_id: 5, ssn: "***-**-1005", first_name: "Emma", last_name: "Brooks", email: "emma@greenleaf.demo", title: "Driver", is_active: false, user_id: null },
];

const CLIENTS: Client[] = [
  { restaurant_id: 1, restaurant_name: "The Green Fork", street_num: 120, street_name: "Maple Ave", city: "Boston", state: "MA", zip_code: "02118", is_active: true, contact_id: 1, email: "orders@greenfork.demo", first_name: "Alex", last_name: "Stone", phone: "617-555-0101", contact_name: "Alex Stone", contact_address: "120 Maple Ave, Boston, MA" },
  { restaurant_id: 2, restaurant_name: "Harvest Table", street_num: 45, street_name: "Beacon St", city: "Cambridge", state: "MA", zip_code: "02139", is_active: true, contact_id: 2, email: "chef@harvesttable.demo", first_name: "Priya", last_name: "Shah", phone: "617-555-0102", contact_name: "Priya Shah", contact_address: "45 Beacon St, Cambridge, MA" },
  { restaurant_id: 3, restaurant_name: "Bistro Verde", street_num: 8, street_name: "Elm St", city: "Somerville", state: "MA", zip_code: "02143", is_active: true, contact_id: 3, email: "hello@bistroverde.demo", first_name: "Marco", last_name: "Ferraro", phone: "617-555-0103", contact_name: "Marco Ferraro", contact_address: "8 Elm St, Somerville, MA" },
  { restaurant_id: 4, restaurant_name: "Root & Stem", street_num: 210, street_name: "Highland Rd", city: "Brookline", state: "MA", zip_code: "02445", is_active: false, contact_id: 4, email: "team@rootandstem.demo", first_name: "Dana", last_name: "Lim", phone: "617-555-0104", contact_name: "Dana Lim", contact_address: "210 Highland Rd, Brookline, MA" },
  { restaurant_id: 5, restaurant_name: "Sage & Salt", street_num: 77, street_name: "Newbury St", city: "Boston", state: "MA", zip_code: "02116", is_active: true, contact_id: 5, email: "orders@sageandsalt.demo", first_name: "Owen", last_name: "Walsh", phone: "617-555-0105", contact_name: "Owen Walsh", contact_address: "77 Newbury St, Boston, MA" },
  { restaurant_id: 6, restaurant_name: "The Daily Sprout", street_num: 312, street_name: "Cambridge St", city: "Cambridge", state: "MA", zip_code: "02141", is_active: true, contact_id: 6, email: "hello@dailysprout.demo", first_name: "Nina", last_name: "Castro", phone: "617-555-0106", contact_name: "Nina Castro", contact_address: "312 Cambridge St, Cambridge, MA" },
  { restaurant_id: 7, restaurant_name: "Field Notes Cafe", street_num: 19, street_name: "Washington St", city: "Somerville", state: "MA", zip_code: "02143", is_active: true, contact_id: 7, email: "team@fieldnotes.demo", first_name: "Jonah", last_name: "Berg", phone: "617-555-0107", contact_name: "Jonah Berg", contact_address: "19 Washington St, Somerville, MA" },
  { restaurant_id: 8, restaurant_name: "Marrow & Vine", street_num: 540, street_name: "Boylston St", city: "Boston", state: "MA", zip_code: "02215", is_active: true, contact_id: 8, email: "chef@marrowandvine.demo", first_name: "Lena", last_name: "Okafor", phone: "617-555-0108", contact_name: "Lena Okafor", contact_address: "540 Boylston St, Boston, MA" },
  { restaurant_id: 9, restaurant_name: "Copper Kettle", street_num: 88, street_name: "Hampshire St", city: "Cambridge", state: "MA", zip_code: "02139", is_active: false, contact_id: 9, email: "info@copperkettle.demo", first_name: "Ravi", last_name: "Menon", phone: "617-555-0109", contact_name: "Ravi Menon", contact_address: "88 Hampshire St, Cambridge, MA" },
  { restaurant_id: 10, restaurant_name: "Lantern Room", street_num: 6, street_name: "Holland St", city: "Somerville", state: "MA", zip_code: "02144", is_active: true, contact_id: 10, email: "orders@lanternroom.demo", first_name: "Tess", last_name: "Ardvisson", phone: "617-555-0110", contact_name: "Tess Ardvisson", contact_address: "6 Holland St, Somerville, MA" },
];

// ----------------------------------------------------------------------------
// Date-driven generation (offsets resolved against ANCHOR)
// ----------------------------------------------------------------------------

// Forward window (in days) the demo should stay populated for. ~194 days
// reaches Dec 31 when opened mid-June; 200 leaves a little headroom and, because
// everything is offset-based, the window slides forward whenever the demo opens.
const FORWARD_DAYS = 200;

/** Inclusive integer range [start, end]. */
function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Every crop is grown at every offset in this window. The summary resolvers
// filter by exact date, so any day from a few days back through the end of the
// year has planting, germination, light-switch and harvest activity regardless
// of when the demo is opened.
const LOT_OFFSETS = range(-3, FORWARD_DAYS);

const LOTS: Lot[] = LOT_OFFSETS.flatMap((harvestOffset) =>
  CROPS.map((crop) => ({
    crop,
    harvestOffset,
    // Deterministic tray count (no Math.random so behaviour is stable).
    trays: ((crop.crop_id * 7 + (harvestOffset + 3) * 3) % 18) + 4,
  })),
);

function plantOffset(lot: Lot): number {
  return lot.harvestOffset - lot.crop.rack_grow_days;
}
function germOutOffset(lot: Lot): number {
  return plantOffset(lot) + 3;
}
function switchOffset(lot: Lot): number {
  return lot.harvestOffset - lot.crop.days_direct_light;
}

/** offset (in days) of an ISO date relative to ANCHOR. */
function offsetOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  return Math.round((target.getTime() - ANCHOR.getTime()) / 86_400_000);
}

export function plantingSummary(dateStr: string) {
  const off = offsetOf(dateStr);
  return LOTS.filter((l) => plantOffset(l) === off).map((l) => ({
    crop_name: l.crop.crop_name,
    trays_used: l.trays,
  }));
}

export function germinationSummary(dateStr: string) {
  const off = offsetOf(dateStr);
  return LOTS.filter((l) => germOutOffset(l) === off).map((l) => ({
    planting_date: dayOffset(plantOffset(l)),
    crop_name: l.crop.crop_name,
    trays_used: l.trays,
  }));
}

export function switchSummary(dateStr: string) {
  const off = offsetOf(dateStr);
  return LOTS.filter((l) => switchOffset(l) === off).map((l) => ({
    planting_date: dayOffset(plantOffset(l)),
    crop_name: l.crop.crop_name,
    trays_used: l.trays,
  }));
}

export function cropsToHarvest(dateStr: string) {
  const off = offsetOf(dateStr);
  return LOTS.filter((l) => l.harvestOffset === off).map((l) => ({
    planting_date: dayOffset(plantOffset(l)),
    crop_name: l.crop.crop_name,
    trays_to_harvest: l.trays,
  }));
}

// Deliveries (and the orders tied to them) run daily from a couple of days back
// through the end-of-year forward window, so the orders page stays populated.
const DELIVERY_OFFSETS = range(-2, FORWARD_DAYS);

function makeDeliveries(): Delivery[] {
  return DELIVERY_OFFSETS.map((off, i) => {
    const driver = off < 0 ? EMPLOYEES[1] : i % 2 === 0 ? EMPLOYEES[2] : null;
    return {
      delivery_date: dayOffset(off),
      delivery_status: off < 0 ? "completed" : "scheduled",
      employee_id: driver ? driver.employee_id : null,
      first_name: driver ? driver.first_name : null,
      last_name: driver ? driver.last_name : null,
    };
  });
}

const ORDERS_PER_DAY = 15;

function makeOrders(): Order[] {
  const orders: Order[] = [];
  let orderId = 1000;
  // Only active restaurants receive orders; rotated deterministically so each
  // delivery day spreads its 15 orders across clients and the 7 products.
  const activeClients = CLIENTS.filter((c) => c.is_active);
  DELIVERY_OFFSETS.forEach((off, di) => {
    for (let n = 0; n < ORDERS_PER_DAY; n++) {
      const client = activeClients[(di + n) % activeClients.length];
      const product = PRODUCTS[(di * 3 + n) % PRODUCTS.length];
      orders.push({
        order_id: orderId++,
        restaurant_id: client.restaurant_id,
        product_id: product.product_id,
        product_name: product.product_name,
        package_type: product.size_type,
        quantity: 3 + ((di + n) % 8),
        order_status: off < 0 ? "completed" : "scheduled",
        employee_id: 0,
        delivery_date: dayOffset(off),
        is_forced: false,
      });
    }
  });
  return orders;
}

// ----------------------------------------------------------------------------
// Mutable store (writes in demo mode update these so the UI reacts)
// ----------------------------------------------------------------------------

export const db = {
  crops: CROPS.map((c) => ({ ...c })),
  packagings: PACKAGINGS.map((p) => ({ ...p })),
  products: PRODUCTS.map((p) => ({ ...p })),
  employees: EMPLOYEES.map((e) => ({ ...e })),
  clients: CLIENTS.map((c) => ({ ...c })),
  deliveries: makeDeliveries(),
  orders: makeOrders(),
  profile: {
    user_id: 1,
    email: "maya@greenleaf.demo",
    employee_id: 1,
    first_name: "Maya",
    last_name: "Reyes",
  },
  counters: {
    restaurant_id: 100,
    contact_id: 100,
    employee_id: 100,
    order_id: 5000,
    product_id: 100,
    package_id: 100,
  },
};
