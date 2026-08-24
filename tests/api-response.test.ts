import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  invalidBodyResponse,
  jsonError,
  jsonOk,
  parseJsonBody,
  zodErrorDetails,
} from "@/lib/api-response";

const nestedSchema = z.object({
  price: z.number().positive(),
  meta: z.object({ title_ar: z.string().min(1) }),
});

function jsonResponse(response: Response): { status: number; body: unknown } {
  return { status: response.status, body: response.headers.get("content-type") };
}

describe("jsonOk", () => {
  it("returns 200 with a JSON body by default", async () => {
    const response = jsonOk({ items: [], total: 0 });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [], total: 0 });
    expect(jsonResponse(response).body).toBe("application/json");
  });

  it("supports custom init such as status 201", async () => {
    const response = jsonOk({ id: "p1" }, { status: 201 });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: "p1" });
  });
});

describe("jsonError", () => {
  it("returns { error } without details when omitted", async () => {
    const response = jsonError("Product not found", 404);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Product not found" });
  });

  it("includes details when provided", async () => {
    const response = jsonError("Invalid request body", 400, { price: ["bad"] });
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request body",
      details: { price: ["bad"] },
    });
  });

  it("never echoes internals for unexpected failures", async () => {
    const response = jsonError("Internal server error", 500);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toEqual({ error: "Internal server error" });
    expect(Object.keys(body)).toHaveLength(1);
  });
});

describe("zodErrorDetails", () => {
  it("maps each issue path to an array of messages", () => {
    const result = nestedSchema.safeParse({ price: -1, meta: { title_ar: "" } });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(zodErrorDetails(result.error)).toEqual({
      price: ["Too small: expected number to be >0"],
      "meta.title_ar": ["Too small: expected string to have >=1 characters"],
    });
  });

  it("groups multiple messages under one field", () => {
    const schema = z.object({ q: z.string().trim().min(2).max(3) });
    const result = schema.safeParse({ q: " x " });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(zodErrorDetails(result.error)["q"]).toHaveLength(1);
  });

  it("uses _ as key for root-level issues", () => {
    const schema = z.object({ minPrice: z.number() }).refine(() => false, {
      message: "range invalid",
      path: [],
    });
    const result = schema.safeParse({ minPrice: 1 });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(zodErrorDetails(result.error)).toEqual({ _: ["range invalid"] });
  });
});

describe("invalidBodyResponse", () => {
  it("produces a 400 with error and field details", async () => {
    const result = nestedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (result.success) return;
    const response = invalidBodyResponse(result.error);
    expect(response.status).toBe(400);
    const body = (await response.json()) as {
      error: string;
      details: Record<string, string[]>;
    };
    expect(body.error).toBe("Invalid request body");
    expect(Object.keys(body.details)).toContain("price");
  });
});

describe("parseJsonBody", () => {
  it("parses a valid JSON body", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "password123" }),
      headers: { "content-type": "application/json" },
    });
    await expect(parseJsonBody(request)).resolves.toEqual({
      username: "admin",
      password: "password123",
    });
  });

  it("returns null on malformed JSON instead of throwing", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: "{not-json",
      headers: { "content-type": "application/json" },
    });
    await expect(parseJsonBody(request)).resolves.toBeNull();
  });

  it("returns null on empty body", async () => {
    const request = new Request("http://localhost/api", { method: "POST" });
    await expect(parseJsonBody(request)).resolves.toBeNull();
  });
});
