import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2 py-1", "text-sm")).toBe("px-2 py-1 text-sm");
  });

  it("resolves tailwind conflicts with the last class winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignores falsy inputs", () => {
    expect(cn("px-2", false, undefined, null)).toBe("px-2");
  });
});
