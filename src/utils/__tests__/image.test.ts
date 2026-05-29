import { describe, it, expect } from "vitest";
import { getThumbnailUrl } from "../image";

describe("getThumbnailUrl", () => {
  it("adds w and q params to Unsplash URLs without query string", () => {
    const url = "https://images.unsplash.com/photo-123";
    expect(getThumbnailUrl(url)).toBe("https://images.unsplash.com/photo-123?w=400&q=60");
  });

  it("appends params to Unsplash URLs that already have query string", () => {
    const url = "https://images.unsplash.com/photo-123?fit=crop";
    expect(getThumbnailUrl(url)).toBe("https://images.unsplash.com/photo-123?fit=crop&w=400&q=60");
  });

  it("returns base64 data URLs unchanged", () => {
    const url = "data:image/jpeg;base64,/9j/abc123";
    expect(getThumbnailUrl(url)).toBe(url);
  });

  it("returns non-Unsplash URLs unchanged", () => {
    const url = "https://storage.example.com/photos/abc.jpg";
    expect(getThumbnailUrl(url)).toBe(url);
  });

  it("returns empty string unchanged", () => {
    expect(getThumbnailUrl("")).toBe("");
  });
});
