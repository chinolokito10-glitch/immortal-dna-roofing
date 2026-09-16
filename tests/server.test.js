import test from "node:test";
import assert from "node:assert/strict";
import { createApp, validateEstimate } from "../server.js";

const valid = {
  name: "Test Homeowner",
  phone: "450-555-0123",
  email: "test@example.com",
  city: "Brossard",
  service: "Roof Repair",
  message: "Test only",
  consent: "on",
  website: "",
};
async function withServer(options, run) {
  const server = createApp(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
const post = (base, data = valid, extra = {}) =>
  fetch(`${base}/api/estimates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    ...extra,
  });

test("validates lead fields, service, consent and honeypot", () => {
  assert.equal(validateEstimate(valid).email, valid.email);
  for (const patch of [
    { name: "" },
    { email: "bad" },
    { phone: "abcdefg" },
    { service: "unknown" },
    { consent: false },
    { website: "spam" },
    { message: "x".repeat(3001) },
  ])
    assert.equal(validateEstimate({ ...valid, ...patch }), null);
});
test("unconfigured delivery never reports success; private files are inaccessible", () =>
  withServer({}, async (base) => {
    assert.deepEqual(await (await fetch(`${base}/api/config`)).json(), {
      estimatesEnabled: false,
    });
    assert.equal((await post(base)).status, 503);
    for (const name of [
      ".env",
      "server.js",
      "package.json",
      "AGENTS.md",
      ".gitconfig",
      "assets/../server.js",
    ])
      assert.equal((await fetch(`${base}/${name}`)).status, 404);
    const homepage = await fetch(base);
    assert.equal(homepage.status, 200);
    assert.ok(
      homepage.headers
        .get("content-security-policy")
        .includes("frame-ancestors 'none'"),
    );
  }));
test("forwards validated request and only confirms an accepted upstream response", () =>
  withServer(
    {
      webhookUrl: "https://example.com/lead",
      webhookToken: "test-secret",
      fetchImpl: async (url, options) => {
        assert.equal(options.headers.Authorization, "Bearer test-secret");
        const data = JSON.parse(options.body);
        assert.equal(data.name, valid.name);
        assert.equal(data.website, undefined);
        return new Response(null, { status: 204 });
      },
    },
    async (base) => {
      const config = await (await fetch(`${base}/api/config`)).text();
      assert.ok(!config.includes("test-secret"));
      const response = await post(base);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { sent: true });
    },
  ));
test("upstream failure, malformed JSON, origin and invalid input return useful errors", () =>
  withServer(
    {
      webhookUrl: "https://example.com/lead",
      fetchImpl: async () => new Response(null, { status: 500 }),
    },
    async (base) => {
      const failed = await post(base);
      assert.equal(failed.status, 502);
      assert.equal((await failed.json()).sent, false);
      assert.equal((await post(base, { ...valid, email: "bad" })).status, 422);
      assert.equal((await post(base, valid, { body: "bad json" })).status, 400);
      assert.equal(
        (
          await post(base, valid, {
            headers: {
              "Content-Type": "application/json",
              Origin: "https://other.example",
            },
          })
        ).status,
        403,
      );
      assert.equal(
        (await post(base, valid, { body: "x".repeat(10001) })).status,
        413,
      );
    },
  ));
test("rate limits repeat submissions", () =>
  withServer({ rateLimit: 1 }, async (base) => {
    await post(base);
    const response = await post(base);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "600");
  }));
