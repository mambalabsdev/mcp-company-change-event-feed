# Company Change-Event Feed MCP Server

[![Smithery](https://smithery.ai/badge/mambabuilt/mcp-company-change-event-feed)](https://smithery.ai/servers/mambabuilt/mcp-company-change-event-feed) [![Glama score](https://glama.ai/mcp/servers/mambalabsdev/mcp-company-change-event-feed/badges/score.svg)](https://glama.ai/mcp/servers/mambalabsdev/mcp-company-change-event-feed) [![MCP Registry](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fregistry.modelcontextprotocol.io%2Fv0%2Fservers%3Fsearch%3Dcom.mambabuilt%252Fmcp-company-change-event-feed%26limit%3D1&query=%24.servers%5B0%5D._meta%5B%22io.modelcontextprotocol.registry%2Fofficial%22%5D.status&label=mcp%20registry&color=blue)](https://registry.modelcontextprotocol.io/v0/servers?search=com.mambabuilt/mcp-company-change-event-feed&limit=1) [![npm version](https://img.shields.io/npm/v/@mambalabsdev/mcp-company-change-event-feed)](https://www.npmjs.com/package/@mambalabsdev/mcp-company-change-event-feed) [![npm downloads](https://img.shields.io/npm/dm/@mambalabsdev/mcp-company-change-event-feed)](https://www.npmjs.com/package/@mambalabsdev/mcp-company-change-event-feed) [![license](https://img.shields.io/github/license/mambalabsdev/mcp-company-change-event-feed)](https://github.com/mambalabsdev/mcp-company-change-event-feed/blob/main/LICENSE) [![mcpservers.org](https://img.shields.io/badge/mcpservers.org-listed-blue)](https://mcpservers.org/servers/mambalabsdev/mcp-company-change-event-feed)

Company Change-Event Feed monitors a company domain for changes across hiring, tech stack, funding, firmographics, and social presence, then diffs the current state against your last run and returns only what changed as typed change events. Flat, Clay-ready JSON, one row per company, built for RevOps teams, outbound agencies, Clay users, and AI agents that need delta intelligence on target accounts.

## What's Inside

- [What it does](#what-it-does)
- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Example prompts](#example-prompts)
- [Tool and inputs](#tool-and-inputs)
- [Full actor documentation](#full-actor-documentation)
- [Mamba Labs GTM Suite](#mamba-labs-gtm-suite)
- [License](#license)

## What it does

This server gives an AI client one tool:

- `get_company_changes`: monitor a company domain for changes across hiring, tech stack, funding, firmographics, and social since the last run. The first run for a domain records a clean baseline (no changes); every run after that returns only the deltas as typed change events, each with a severity, a confidence, an old and new value, and the immutable Actor ID of the source that produced it.

All of the work runs on Apify. This package is a thin client that routes the tool call to the actor and hands back the result.

## Quick start

You need Node.js 18 or newer and an Apify account with an API token.

Add this to your Claude Desktop config:

```json
{
  "mcpServers": {
    "company-change-event-feed": {
      "command": "npx",
      "args": ["-y", "@mambalabsdev/mcp-company-change-event-feed"],
      "env": {
        "APIFY_TOKEN": "your-apify-token"
      }
    }
  }
}
```

Get your token at https://console.apify.com/account/integrations, paste it in, and restart Claude Desktop. The tool will be available.

## Prerequisites

- Node.js 18 or newer
- An Apify account with an API token

## Example prompts

- "What changed at stripe.com since the last check across hiring, tech stack, and firmographics?"
- "Monitor hubspot.com and tell me only the high-severity changes."
- "Run a baseline for deel.com (company name Deel), then check it next week for deltas."
- "Did anything change in the GTM signals for notion.so?"

## Tool and inputs

`get_company_changes`:

- `domain` (string, required): company domain to monitor, without https or www, e.g. stripe.com.
- `company_name` (string, optional): company name hint, used when the domain does not match the brand name, e.g. Deel for deel.com.

The output is one row per company: `company_domain`, `company_name`, `run_date`, `is_baseline`, `total_changes`, `has_high_severity`, `latest_change_date`, a `changes` array of typed change events, a `source_status` object (`ok` / `degraded` / `skipped` per source), and a `snapshot` object carrying the current state for the next run's comparison. Each change event has `event_type`, `severity`, `confidence`, `old_value`, `new_value`, and the `source_actor` immutable Actor ID.

Funding signals are coming soon: the funding source ships as `skipped` until its sub-actor goes live, after which funding, exec move, product launch, and acquisition events appear automatically.

## Full actor documentation

For the complete input and output reference, pricing, and run history, see the Company Change-Event Feed actor on the Apify Store:

https://apify.com/mambalabs/company-change-event-feed

---

## Mamba Labs GTM Suite

This server is part of the **Mamba Labs GTM Suite**, a fleet of twelve specialized MCP servers for go-to-market signal intelligence, each backed by a dedicated Apify actor.

| Actor | Immutable Actor ID |
|---|---|
| [GTM Hiring Signal Scraper](https://console.apify.com/actors/D7O1SA2EqwHGsGr1P) | `D7O1SA2EqwHGsGr1P` |
| [GTM Tech Stack Signal Enrichment](https://console.apify.com/actors/qyd7nNyqFPelQViBx) | `qyd7nNyqFPelQViBx` |
| [GTM Signals Aggregator](https://console.apify.com/actors/xKdRfnfFNkdMpFuNs) | `xKdRfnfFNkdMpFuNs` |
| [Job Board Keyword Signal Scanner](https://console.apify.com/actors/4DvqpvhMR74NLcDDY) | `4DvqpvhMR74NLcDDY` |
| [Domain to LinkedIn URL Resolver](https://console.apify.com/actors/3HtnSaqPHOg1Qg5gx) | `3HtnSaqPHOg1Qg5gx` |
| [ICP Fit Scorer](https://console.apify.com/actors/W161DT8W4kW55dMFh) | `W161DT8W4kW55dMFh` |
| [Domain Deliverability Checker](https://console.apify.com/actors/0tVgxI7A6o9jMlxmc) | `0tVgxI7A6o9jMlxmc` |
| [Company Firmographic Enricher](https://console.apify.com/actors/YlUtLWjfPpqykmB8g) | `YlUtLWjfPpqykmB8g` |
| [Company Social Presence Mapper](https://console.apify.com/actors/4k6CCemkgBDz18m2h) | `4k6CCemkgBDz18m2h` |
| [Company Identity Resolver](https://console.apify.com/actors/lr8fTRAmZCBZmuwwh) | `lr8fTRAmZCBZmuwwh` |
| [Company Change-Event Feed](https://console.apify.com/actors/oX44rS0fkEJ3rXLWe) | `oX44rS0fkEJ3rXLWe` |
| [Funding & Press Signal Scanner](https://console.apify.com/actors/FS13X6dhQVgX3XOM6) | `FS13X6dhQVgX3XOM6` |

> Built by [Mamba Labs](https://github.com/mambalabsdev) | [npm](https://www.npmjs.com/org/mambalabsdev) | [Apify Store](https://apify.com/mambalabs)

## License

MIT

Built by Mamba Labs. https://apify.com/mambalabs
