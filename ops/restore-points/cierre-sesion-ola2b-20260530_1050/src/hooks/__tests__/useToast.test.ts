import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "../useToast";

describe("useToast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts hidden", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.showStatusToast).toBe(false);
    expect(result.current.toastMessage).toBe("");
  });

  it("shows toast with message", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.showToast("Hola!"); });
    expect(result.current.showStatusToast).toBe(true);
    expect(result.current.toastMessage).toBe("Hola!");
  });

  it("auto-hides after default duration (3000ms)", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.showToast("Mensaje"); });
    expect(result.current.showStatusToast).toBe(true);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.showStatusToast).toBe(false);
  });

  it("respects custom duration", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.showToast("Lento", 5000); });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.showStatusToast).toBe(true);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.showStatusToast).toBe(false);
  });
});
