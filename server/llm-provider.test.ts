import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = ["GEMINI_API_KEY", "GEMINI_MODEL", "BUILT_IN_FORGE_API_KEY", "BUILT_IN_FORGE_API_URL"] as const;
const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) originalEnv[key] = process.env[key];
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("invokeLLM provider selection", () => {
  it("calls the direct Gemini endpoint when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    delete process.env.BUILT_IN_FORGE_API_KEY;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "ok" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { invokeLLM } = await import("./_core/llm");
    await invokeLLM({ messages: [{ role: "user", content: "hi" }] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");
    expect(options.headers.authorization).toBe("Bearer test-gemini-key");
    const body = JSON.parse(options.body);
    expect(body.model).toBe("gemini-3.6-flash");
    expect(body.thinking).toBeUndefined();
  });

  it("falls back to the Manus forge proxy when only BUILT_IN_FORGE_API_KEY is set", async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.BUILT_IN_FORGE_API_KEY = "test-forge-key";
    delete process.env.BUILT_IN_FORGE_API_URL;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "ok" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { invokeLLM } = await import("./_core/llm");
    await invokeLLM({ messages: [{ role: "user", content: "hi" }] });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://forge.manus.im/v1/chat/completions");
    expect(options.headers.authorization).toBe("Bearer test-forge-key");
    const body = JSON.parse(options.body);
    expect(body.thinking).toEqual({ budget_tokens: 128 });
  });

  it("throws a clear error when neither provider is configured", async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.BUILT_IN_FORGE_API_KEY;

    const { invokeLLM } = await import("./_core/llm");
    await expect(invokeLLM({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow(
      /No LLM provider configured/
    );
  });
});
