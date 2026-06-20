/**
 * Demo-mode request router. Maps (method, path) pairs to the in-memory store in
 * ./data and returns real `Response` objects, so callers using `res.ok` /
 * `res.json()` work unchanged. Lets the static UI be deployed and explored with
 * no backend or database.
 */
import {
  db,
  plantingSummary,
  germinationSummary,
  switchSummary,
  cropsToHarvest,
  type Order,
} from "./data";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== "string") return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function restaurantName(restaurantId: number): string {
  return db.clients.find((c) => c.restaurant_id === restaurantId)?.restaurant_name ?? "Unknown";
}

interface Route {
  method: string;
  pattern: RegExp;
  handler: (params: string[], body: Record<string, unknown>) => Response;
}

const routes: Route[] = [
  // ---- Auth / profile -----------------------------------------------------
  {
    method: "POST",
    pattern: /^\/login$/,
    handler: () => json({ access_token: "demo-token", token_type: "bearer" }),
  },
  {
    method: "POST",
    pattern: /^\/register$/,
    handler: () => json({ status: "ok" }),
  },
  {
    method: "GET",
    pattern: /^\/profile$/,
    handler: () => json(db.profile),
  },

  // ---- Home summaries -----------------------------------------------------
  {
    method: "GET",
    pattern: /^\/home\/planting_summary\/(.+)$/,
    handler: ([date]) => json(plantingSummary(date)),
  },
  {
    method: "GET",
    pattern: /^\/home\/germination_summary\/(.+)$/,
    handler: ([date]) => json(germinationSummary(date)),
  },
  {
    method: "GET",
    pattern: /^\/home\/light_switch_summary\/(.+)$/,
    handler: ([date]) => json(switchSummary(date)),
  },

  // ---- Harvest ------------------------------------------------------------
  {
    method: "GET",
    pattern: /^\/harvests\/get_orders_to_deliver\/(.+)$/,
    handler: ([date]) =>
      json(
        db.orders
          .filter((o) => o.delivery_date === date)
          .map((o) => ({
            product_name: o.product_name,
            package_info: `${o.quantity} × ${o.package_type}`,
          })),
      ),
  },
  {
    method: "GET",
    pattern: /^\/harvests\/get_crops_to_harvest\/(.+)$/,
    handler: ([date]) => json(cropsToHarvest(date)),
  },

  // ---- Orders -------------------------------------------------------------
  {
    method: "POST",
    pattern: /^\/orders\/$/,
    handler: (_p, body) => {
      const client = db.clients.find((c) => c.restaurant_name === body.restaurant_name);
      const product = db.products.find((p) => p.product_name === body.product_name);
      const newOrder: Order = {
        order_id: db.counters.order_id++,
        restaurant_id: client ? client.restaurant_id : 0,
        product_id: product ? product.product_id : 0,
        product_name: String(body.product_name ?? ""),
        package_type: String(body.package_type ?? ""),
        quantity: Number(body.product_quantity ?? 1),
        order_status: String(body.order_status ?? "scheduled"),
        employee_id: 0,
        delivery_date: String(body.delivery_date ?? ""),
        is_forced: false,
      };
      db.orders.push(newOrder);
      return json({ status: "ok", order_id: newOrder.order_id });
    },
  },
  {
    method: "PUT",
    pattern: /^\/orders\/(\d+)\/update_product\/(\d+)$/,
    handler: ([orderId, productId], body) => {
      const order = db.orders.find(
        (o) => o.order_id === Number(orderId) && o.product_id === Number(productId),
      );
      if (order) {
        if (body.quantity != null) order.quantity = Number(body.quantity);
        if (body.package_type != null) order.package_type = String(body.package_type);
        if (body.order_status != null) order.order_status = String(body.order_status);
      }
      return json({ status: "ok" });
    },
  },
  {
    method: "DELETE",
    pattern: /^\/orders\/(\d+)\/delete_product\/(\d+)$/,
    handler: ([orderId, productId]) => {
      db.orders = db.orders.filter(
        (o) => !(o.order_id === Number(orderId) && o.product_id === Number(productId)),
      );
      return json({ status: "ok" });
    },
  },
  {
    method: "GET",
    pattern: /^\/orders\/(.+)$/,
    handler: ([date]) => {
      const grouped: Record<string, Order[]> = {};
      for (const order of db.orders.filter((o) => o.delivery_date === date)) {
        const name = restaurantName(order.restaurant_id);
        (grouped[name] ??= []).push(order);
      }
      return json(grouped);
    },
  },

  // ---- Deliveries ---------------------------------------------------------
  {
    method: "GET",
    pattern: /^\/deliveries\/$/,
    handler: () => json(db.deliveries),
  },
  {
    method: "PUT",
    pattern: /^\/deliveries\/$/,
    handler: (_p, body) => {
      const delivery = db.deliveries.find((d) => d.delivery_date === body.delivery_date);
      if (delivery) delivery.delivery_status = String(body.delivery_status ?? delivery.delivery_status);
      return json({ status: "ok" });
    },
  },
  {
    method: "POST",
    pattern: /^\/deliveries\/(.+)$/,
    handler: ([date]) => {
      if (!db.deliveries.some((d) => d.delivery_date === date)) {
        db.deliveries.push({ delivery_date: date, delivery_status: "scheduled", employee_id: null, first_name: null, last_name: null });
        db.deliveries.sort((a, b) => a.delivery_date.localeCompare(b.delivery_date));
      }
      return json({ status: "ok" });
    },
  },

  // ---- Clients ------------------------------------------------------------
  {
    method: "GET",
    pattern: /^\/clients\/restaurant_information$/,
    handler: () => json(db.clients),
  },
  {
    method: "POST",
    pattern: /^\/clients\/$/,
    handler: (_p, body) => {
      const id = db.counters.restaurant_id++;
      db.clients.push({
        restaurant_id: id,
        restaurant_name: String(body.restaurant_name ?? ""),
        street_num: body.street_num != null ? Number(body.street_num) : null,
        street_name: String(body.street_name ?? ""),
        city: String(body.city ?? ""),
        state: String(body.state ?? ""),
        zip_code: String(body.zip_code ?? ""),
        is_active: true,
        contact_id: 0,
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        contact_name: "",
        contact_address: "",
      });
      return json({ restaurant_id: id });
    },
  },
  {
    method: "PUT",
    pattern: /^\/clients\/restaurant_info$/,
    handler: (_p, body) => {
      const client = db.clients.find((c) => c.restaurant_id === Number(body.restaurant_id));
      if (client) {
        if (body.restaurant_name != null) client.restaurant_name = String(body.restaurant_name);
        if (body.street_num != null) client.street_num = Number(body.street_num);
        if (body.street_name != null) client.street_name = String(body.street_name);
        if (body.city != null) client.city = String(body.city);
        if (body.state != null) client.state = String(body.state);
        if (body.zip_code != null) client.zip_code = String(body.zip_code);
        if (body.is_active != null) client.is_active = Boolean(body.is_active);
      }
      return json({ status: "ok" });
    },
  },
  {
    method: "POST",
    pattern: /^\/clients\/contact_info$/,
    handler: (_p, body) => {
      const client = db.clients.find((c) => c.restaurant_id === Number(body.restaurant_id));
      if (client) {
        client.contact_id = client.contact_id || db.counters.contact_id++;
        client.email = String(body.email ?? client.email);
        client.first_name = String(body.first_name ?? client.first_name);
        client.last_name = String(body.last_name ?? client.last_name);
        client.phone = String(body.phone ?? client.phone);
        client.contact_name = `${client.first_name} ${client.last_name}`.trim();
      }
      return json({ status: "ok" });
    },
  },
  {
    method: "PUT",
    pattern: /^\/clients\/contact_info$/,
    handler: (_p, body) => {
      const client = db.clients.find(
        (c) => c.contact_id === Number(body.contact_id) || c.restaurant_id === Number(body.restaurant_id),
      );
      if (client) {
        if (body.email != null) client.email = String(body.email);
        if (body.first_name != null) client.first_name = String(body.first_name);
        if (body.last_name != null) client.last_name = String(body.last_name);
        if (body.phone != null) client.phone = String(body.phone);
        client.contact_name = `${client.first_name} ${client.last_name}`.trim();
      }
      return json({ status: "ok" });
    },
  },
  {
    method: "DELETE",
    pattern: /^\/clients\/contact_info$/,
    handler: (_p, body) => {
      const client = db.clients.find(
        (c) => c.contact_id === Number(body.contact_id) || c.restaurant_id === Number(body.restaurant_id),
      );
      if (client) {
        client.email = "";
        client.first_name = "";
        client.last_name = "";
        client.phone = "";
        client.contact_name = "";
        client.contact_id = 0;
      }
      return json({ status: "ok" });
    },
  },

  // ---- Products / packaging ----------------------------------------------
  {
    method: "GET",
    pattern: /^\/product\/product_information$/,
    handler: () => json(db.products),
  },
  {
    method: "GET",
    pattern: /^\/product\/packaging_options$/,
    handler: () => json(db.packagings),
  },
  {
    method: "GET",
    pattern: /^\/product\/(.+)\/packaging_options$/,
    handler: ([productName]) => {
      const name = decodeURIComponent(productName);
      const sizes = db.products
        .filter((p) => p.product_name === name)
        .map((p) => ({ package_id: String(p.package_id), size_type: p.size_type }));
      return json(sizes);
    },
  },
  {
    method: "POST",
    pattern: /^\/product\/add_product$/,
    handler: () => json({ status: "ok" }),
  },
  {
    method: "POST",
    pattern: /^\/product\/add_product_size$/,
    handler: (_p, body) => {
      const crop = db.crops[0];
      const packaging = db.packagings.find((pk) => String(pk.package_id) === String(body.package_id)) ?? db.packagings[0];
      db.products.push({
        product_id: db.counters.product_id++,
        crop_id: crop.crop_id,
        product_name: String(body.product_name ?? "New Product"),
        weight_grams: body.weight_grams != null ? Number(body.weight_grams) : 0,
        crop_ratio: 1,
        crop_name: crop.crop_name,
        package_id: packaging.package_id,
        size_type: packaging.size_type,
        is_active: body.is_active === false ? 0 : 1,
      });
      return json({ status: "ok" });
    },
  },
  {
    method: "PUT",
    pattern: /^\/product\/update_product_size$/,
    handler: () => json({ status: "ok" }),
  },
  {
    method: "PUT",
    pattern: /^\/product\/update_composition$/,
    handler: () => json({ status: "ok" }),
  },
  {
    method: "POST",
    pattern: /^\/product\/add_packaging$/,
    handler: (_p, body) => {
      const name = String(body.size_type ?? body.package_name ?? "New Package");
      if (!db.packagings.some((p) => p.size_type === name)) {
        db.packagings.push({ package_id: db.counters.package_id++, size_type: name });
      }
      return json({ status: "ok" });
    },
  },
  {
    method: "PUT",
    pattern: /^\/product\/update_packaging\/(.+)$/,
    handler: ([originalName], body) => {
      const name = decodeURIComponent(originalName);
      const packaging = db.packagings.find((p) => p.size_type === name);
      if (packaging && body.size_type != null) packaging.size_type = String(body.size_type);
      return json({ status: "ok" });
    },
  },

  // ---- Crops --------------------------------------------------------------
  {
    method: "GET",
    pattern: /^\/crops\/grow_information$/,
    handler: () => json(db.crops),
  },
  {
    method: "POST",
    pattern: /^\/crops\/$/,
    handler: (_p, body) => {
      db.crops.push({
        crop_id: db.crops.reduce((m, c) => Math.max(m, c.crop_id), 0) + 1,
        crop_name: String(body.crop_name ?? "New Crop"),
        seed_type: String(body.seed_type ?? ""),
        sow_rate: Number(body.sow_rate ?? 0),
        overnight_soak: Boolean(body.overnight_soak),
        days_direct_light: Number(body.days_direct_light ?? 0),
        days_indirect_light: Number(body.days_indirect_light ?? 0),
        lead_time: 1,
        rack_grow_days: Number(body.rack_grow_days ?? 0),
        yield_per_tray: Number(body.yield_per_tray ?? 0),
        germination_type: String(body.germination_type ?? "covered"),
      });
      return json({ status: "ok" });
    },
  },
  {
    method: "PUT",
    pattern: /^\/crops\/$/,
    handler: (_p, body) => {
      const crop = db.crops.find((c) => c.crop_id === Number(body.crop_id));
      if (crop) {
        for (const key of Object.keys(body)) {
          if (key in crop && body[key] != null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (crop as any)[key] = body[key];
          }
        }
      }
      return json({ status: "ok" });
    },
  },

  // ---- Employees ----------------------------------------------------------
  {
    method: "GET",
    pattern: /^\/employees\/$/,
    handler: () => json(db.employees),
  },
  {
    method: "POST",
    pattern: /^\/employees\/add_employee$/,
    handler: (_p, body) => {
      db.employees.push({
        employee_id: db.counters.employee_id++,
        ssn: String(body.ssn ?? "***-**-0000"),
        first_name: String(body.first_name ?? ""),
        last_name: String(body.last_name ?? ""),
        email: String(body.email ?? ""),
        title: String(body.title ?? "Staff"),
        is_active: body.is_active === false ? false : true,
        user_id: null,
      });
      return json({ status: "ok" });
    },
  },
  {
    method: "PUT",
    pattern: /^\/employees\/assign_delivery$/,
    handler: (_p, body) => {
      const delivery = db.deliveries.find((d) => d.delivery_date === body.delivery_date);
      const employee = db.employees.find((e) => e.employee_id === Number(body.employee_id));
      if (delivery && employee) {
        if (delivery.delivery_status === "cancelled" || delivery.delivery_status === "completed") {
          return json({ detail: "Cannot assign a driver to a cancelled or completed delivery." }, 400);
        }
        delivery.employee_id = employee.employee_id;
        delivery.first_name = employee.first_name;
        delivery.last_name = employee.last_name;
      }
      return json({ status: "ok" });
    },
  },
  {
    method: "PUT",
    pattern: /^\/employees\/assign_planting$/,
    handler: () => json({ status: "ok" }),
  },
  {
    method: "PUT",
    pattern: /^\/employees\/update_employee\/(\d+)$/,
    handler: ([id], body) => {
      const employee = db.employees.find((e) => e.employee_id === Number(id));
      if (employee) {
        if (body.first_name != null) employee.first_name = String(body.first_name);
        if (body.last_name != null) employee.last_name = String(body.last_name);
        if (body.email != null) employee.email = String(body.email);
        if (body.title != null) employee.title = String(body.title);
        if (body.is_active != null) employee.is_active = Boolean(body.is_active);
      }
      // Keep the demo profile in sync when editing your own record.
      if (Number(id) === db.profile.employee_id) {
        if (body.first_name != null) db.profile.first_name = String(body.first_name);
        if (body.last_name != null) db.profile.last_name = String(body.last_name);
        if (body.email != null) db.profile.email = String(body.email);
      }
      return json({ status: "ok" });
    },
  },
];

/**
 * Resolve a backend request entirely in-memory. `path` is a leading-slash path
 * such as "/orders/2026-01-01" (the same string apiFetch would append to the
 * API base URL).
 */
export function mockFetch(path: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const cleanPath = path.split("?")[0];
  const body = parseBody(init);

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(cleanPath);
    if (match) {
      return Promise.resolve(route.handler(match.slice(1), body));
    }
  }

  console.warn(`[demo] Unhandled request: ${method} ${cleanPath}`);
  return Promise.resolve(json({ detail: "Not found (demo mode)" }, 404));
}
