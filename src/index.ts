#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(here, "..", "package.json"), "utf8"),
) as { version: string; name: string };

// Distinctive UA so Apify run meta.userAgent marks MCP-originated runs.
const USER_AGENT = `mambalabs-mcp ${pkg.name}@${pkg.version}`;

const APIFY_TOKEN = process.env.APIFY_TOKEN;

type ToolResult = {
  isError?: boolean;
  content: Array<{ type: "text"; text: string }>;
};

// Drop undefined values so optional inputs are not sent to the actor.
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// Shared caller. actorPath is the actor's immutable Apify actor ID (a stable key
// that survives Store renames). The /v2/acts/{id} endpoint accepts it directly,
// so a Store rename never breaks these calls.
async function runActor(
  actorPath: string,
  actorLabel: string,
  input: Record<string, unknown>,
): Promise<ToolResult> {
  if (!APIFY_TOKEN) {
    return { isError: true, content: [{ type: "text", text: "APIFY_TOKEN is not set. Create a token at https://console.apify.com/account/integrations and set it as the APIFY_TOKEN environment variable." }] };
  }

  const url = `https://api.apify.com/v2/acts/${actorPath}/run-sync-get-dataset-items?timeout=300`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${APIFY_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(input),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { isError: true, content: [{ type: "text", text: `Could not reach the Apify API: ${message}` }] };
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body?.error?.message) detail = ` ${body.error.message}`;
    } catch {
      detail = "";
    }

    let message: string;
    switch (response.status) {
      case 401:
        message = "Invalid Apify token. Check your APIFY_TOKEN environment variable.";
        break;
      case 402:
        message =
          "Insufficient Apify credits. Check your account balance at https://console.apify.com/billing";
        break;
      case 408:
        message = `The ${actorLabel} run timed out after 300 seconds. Try again, or run the actor on Apify directly for longer jobs.`;
        break;
      default:
        message = `Apify request to ${actorLabel} failed with status ${response.status}.${detail}`;
    }
    return { isError: true, content: [{ type: "text", text: message }] };
  }

  const items = await response.json();
  return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
}

const server = new McpServer({
  name: "mamba-company-change-event-feed",
  version: pkg.version,
});

// Company Change-Event Feed (immutable actor ID oX44rS0fkEJ3rXLWe)
server.registerTool(
  "get_company_changes",
  {
    title: "Get Company Changes",
    description:
      "Monitor a company domain for changes across hiring, tech stack, funding, firmographics, and social since the last run. Returns only what changed as typed change events in flat, Clay-ready JSON. Read-only; requires APIFY_TOKEN; consumes Apify credits.",
    annotations: {
      title: "Get Company Changes",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      domain: z
        .string()
        .describe("Company domain to monitor, without https or www, e.g. stripe.com."),
      company_name: z
        .string()
        .optional()
        .describe("Optional company name hint, used when the domain does not match the brand name, e.g. Deel for deel.com."),
      previous_snapshot: z
        .record(z.unknown())
        .optional()
        .describe("Snapshot object returned by a prior run. Supply it and it is used as the baseline instead of the stored snapshot, so you can hold delta state outside Apify and keep a scheduled run cheap."),
      sub_actor_timeout_secs: z
        .number()
        .int()
        .optional()
        .describe("Per-child run timeout in seconds. Children run in parallel, so total wall time is about the slowest child. Lower it to keep a quick test run short. Default: 90."),
    },
  },
  async ({ domain, company_name, previous_snapshot, sub_actor_timeout_secs }) => {
    if (domain === undefined || domain.trim() === "") {
      return {
        isError: true,
        content: [{ type: "text", text: "Provide a company domain, e.g. stripe.com." }],
      };
    }
    return runActor(
      "oX44rS0fkEJ3rXLWe",
      "Company Change-Event Feed",
      compact({ domain, company_name, previous_snapshot, sub_actor_timeout_secs }),
    );
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
