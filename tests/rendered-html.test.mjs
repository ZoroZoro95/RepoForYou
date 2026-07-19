import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the generalized repository catalog", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Repo Radar — Find Your Next Open-Source Project<\/title>/i);
  assert.match(html, /Find an open-source repo that fits your stack/i);
  assert.match(html, /Filter by stack and ecosystem/i);
  assert.match(html, /Multiple tags use AND logic/i);
  assert.match(html, /Search curated repos, companies, or technologies/i);
  assert.match(html, /Watched only/i);
  assert.match(html, /Repository catalog/i);
  assert.match(html, /Contribution guide/i);
  assert.match(html, /All GitHub/i);
  assert.match(html, /Curated/i);
  assert.match(html, /aria-label="Repository pages"/i);
  assert.match(html, />Previous</i);
  assert.match(html, />Next</i);
});

test("renders stack and ecosystem filters with watch controls", async () => {
  const response = await render();
  const html = await response.text();

  for (const tag of ["Python", "TypeScript", "JavaScript", "React", "YC"]) {
    assert.match(html, new RegExp(`>${tag}(?:<!-- -->)?\\s*<`));
  }

  assert.match(html, /aria-pressed="false"/i);
  assert.match(html, /Watch issues/i);
  assert.match(html, /Live issue watcher/i);
  assert.doesNotMatch(html, />good first issue</i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is building/i);
});
