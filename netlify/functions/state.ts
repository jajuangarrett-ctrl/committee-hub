import { getStore } from "@netlify/blobs";
import { createInitialDashboardState, normalizeDashboardState } from "../../shared/committee-data";

const STORE_NAME = "committee-hub";
const STATE_KEY = "dashboard-state-v1";

export default async (req: Request) => {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if (req.method === "GET") {
    const stored = await store.get(STATE_KEY, { type: "json" });
    const state = normalizeDashboardState(stored ?? createInitialDashboardState());
    return json(state);
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const state = normalizeDashboardState(body);
    await store.setJSON(STATE_KEY, state);
    return json(state);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/state",
  method: ["GET", "PUT"],
};

function json(body: unknown) {
  return Response.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
