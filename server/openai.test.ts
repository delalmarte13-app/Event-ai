import { describe, it, expect } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("OpenAI API Integration", () => {
  it("should validate OpenAI API key by calling a simple LLM request", async () => {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Eres un asistente útil.",
          },
          {
            role: "user",
            content: "Di 'OK' si todo funciona correctamente.",
          },
        ],
      });

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(response.choices.length).toBeGreaterThan(0);
      expect(response.choices[0].message).toBeDefined();
      expect(response.choices[0].message.content).toBeDefined();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`OpenAI API validation failed: ${errorMsg}`);
    }
  });

  it(
    "should generate video narrative with LLM",
    async () => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Eres un director de cine creativo. Crea narrativas cortas para videos de eventos.",
            },
            {
              role: "user",
              content: "Crea una narrativa corta para un video de boda elegante con 5 fotos.",
            },
          ],
        });

        expect(response).toBeDefined();
        expect(response.choices[0].message.content).toBeTruthy();
        expect(response.choices[0].message.content.length).toBeGreaterThan(10);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Video narrative generation failed: ${errorMsg}`);
      }
    },
    30000
  );
});
