/**
* Simple MCP server runner script.
* This script runs a small MCP server (from `mcp-node`) and wires a search tool
* that forwards queries to your Nest API (QueryService endpoint).
*
* Usage (dev):
* NODE_ENV=development ts-node scripts/mcp-server.ts
*
* Production: compile down (tsc) and run node dist/scripts/mcp-server.js
*/

import { createMcpServer } from 'mcp-node';

// The tool shape used by MCP (adapt if your mcp-node version expects different API)
function createHttpSearchTool({ apiBaseUrl }: { apiBaseUrl: string }) {
    return {
        name: 'http_search_tool',
        description: 'Search documents by proxying to the Nest Query API',
        // The `run` signature depends on your mcp-node version; this is a conservative example
        async run(input: string, options?: { topK?: number }) {
            const url = `${apiBaseUrl.replace(/\/$/, '')}/api/query/search`;
            const body = JSON.stringify({ query: input, topK: options?.topK ?? 5 });


            // use global fetch (Node 18+). If unavailable, user should install node-fetch polyfill.
            const fetchFn = (globalThis as any).fetch ?? (await import('node-fetch')).default;


            const res = await fetchFn(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Search proxy failed: ${res.status} ${text}`);
            }
            const json = await res.json();
            return json;
        },
    };
}

async function main() {
    const port = Number(process.env.MCP_PORT ?? 4000);
    const apiBase = process.env.NEST_API_URL ?? 'http://localhost:3000';


    const server = createMcpServer({
        // tools is an array per mcp-node API
        tools: [createHttpSearchTool({ apiBaseUrl: apiBase })],
    });


    server.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`MCP server listening on ${port}, proxying search to ${apiBase}`);
    });
}


main().catch(err => {
    // eslint-disable-next-line no-console
    console.error('Failed to start MCP server', err);
    process.exit(1);
});