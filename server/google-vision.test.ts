import { describe, it, expect } from "vitest";

describe("Google Vision API Integration", () => {
  it("should validate Google Vision API key is configured", async () => {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    expect(apiKey).toMatch(/^AIza/); // Google API keys start with AIza
  });

  it("should have valid API key format", async () => {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    expect(apiKey).toHaveLength(39); // Google Vision API keys are typically 39 chars
  });
});
