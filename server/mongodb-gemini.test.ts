import { describe, it, expect } from "vitest";

describe("MongoDB and Gemini API Configuration", () => {
  it("should have MONGODB_URI configured", () => {
    const mongoUri = process.env.MONGODB_URI;
    expect(mongoUri).toBeDefined();
    expect(mongoUri).toContain("mongodb");
  });

  it("should have GEMINI_API_KEY configured", () => {
    const geminiKey = process.env.GEMINI_API_KEY;
    expect(geminiKey).toBeDefined();
    expect(geminiKey?.length).toBeGreaterThan(0);
  });

  it("should validate MongoDB URI format", () => {
    const mongoUri = process.env.MONGODB_URI;
    expect(mongoUri).toMatch(/^mongodb\+srv:\/\/.+@.+\.mongodb\.net/);
  });

  it("should validate Gemini API Key format", () => {
    const geminiKey = process.env.GEMINI_API_KEY;
    // Gemini API keys typically start with 'AIza' or similar
    expect(geminiKey?.length).toBeGreaterThan(20);
  });
});
