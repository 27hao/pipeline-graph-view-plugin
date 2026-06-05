/** * @vitest-environment jsdom */

import { act, render } from "@testing-library/react";
import { vi } from "vitest";

import { Paused, Since, Started, Total } from "./timings.tsx";

describe("Timings", () => {
  describe("Total", () => {
    function getTotal(ms: number) {
      return render(<Total ms={ms} />);
    }

    it("should format milliseconds to hours, minutes, and seconds", () => {
      // First check 359 days.
      expect(getTotal(31_017_600_000).getByText("11 mths")).toBeInTheDocument();
      // And 362 days.
      expect(getTotal(31_276_800_000).getByText("12 mths")).toBeInTheDocument();
      // 11.25 years - Check that if the first unit has 2 or more digits, a second unit isn't used.
      expect(getTotal(354_780_000_000).getByText("11y")).toBeInTheDocument();
      // 9.25 years - Check that if the first unit has only 1 digit, a second unit is used.
      expect(getTotal(291_708_000_000).getByText("9y 3m")).toBeInTheDocument();
      // 3 months 14 days
      expect(getTotal(8_985_600_000).getByText("3m 14d")).toBeInTheDocument();
      // 2 day 4 hours
      expect(getTotal(187_200_000).getByText("2d 4h")).toBeInTheDocument();
      // 8 hours 46 minutes
      expect(getTotal(31_560_000).getByText("8h 46m")).toBeInTheDocument();
      // 67 seconds -> 1 minute 7 seconds
      expect(getTotal(67_000).getByText("1m 7s")).toBeInTheDocument();
      // 17 seconds - Check that times less than a minute only use seconds.
      expect(getTotal(17_000).getByText("17s")).toBeInTheDocument();
      // 2001ms -> 2sec floored
      expect(getTotal(2_001).getByText("2s")).toBeInTheDocument();
      // 1712ms -> 1sec floored
      expect(getTotal(1_712).getByText("1s")).toBeInTheDocument();
      // 171ms -> 0.17sec
      expect(getTotal(171).getByText("0.17s")).toBeInTheDocument();
      // 101ms -> 0.1sec
      expect(getTotal(101).getByText("0.1s")).toBeInTheDocument();
      // 17ms
      expect(getTotal(17).getByText("17ms")).toBeInTheDocument();
      // 1ms
      expect(getTotal(1).getByText("1ms")).toBeInTheDocument();
      // 0ms
      expect(getTotal(0).getByText("<1ms")).toBeInTheDocument();
    });
  });

  describe("paused", () => {
    function getPaused(since: number) {
      return render(<Paused since={since} />);
    }

    it("应该在时间前加排队中前缀", () => {
      expect(getPaused(1000).getByText("排队中 1s")).toBeInTheDocument();
      expect(getPaused(100).getByText("排队中 0.1s")).toBeInTheDocument();
      expect(getPaused(10).getByText("排队中 10ms")).toBeInTheDocument();
      expect(getPaused(1).getByText("排队中 1ms")).toBeInTheDocument();
    });
  });

  describe("started", () => {
    const now = Date.now();

    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function getStarted(since: number) {
      return render(<Started live={false} since={since} />);
    }

    it("should return empty element if since is 0", () => {
      expect(getStarted(0).container.innerHTML).toBe("");
    });

    it("应该以 <1s 开始", () => {
      expect(
        getStarted(now - 42).getByText("开始于 <1s 前"),
      ).toBeInTheDocument();
    });

    it("应该向下取整", () => {
      expect(
        getStarted(now - 1500).getByText("开始于 1s 前"),
      ).toBeInTheDocument();
    });

    it("应该在时间前加开始于并在后加前", () => {
      expect(
        getStarted(now - 1000).getByText("开始于 1s 前"),
      ).toBeInTheDocument();
      expect(
        getStarted(now - 60_000).getByText("开始于 1m 前"),
      ).toBeInTheDocument();
      expect(
        getStarted(now - 3_600_000).getByText("开始于 1h 前"),
      ).toBeInTheDocument();
      expect(
        getStarted(now - 86_400_000).getByText("开始于 1d 前"),
      ).toBeInTheDocument();
    });

    it("实时时应每秒递增", async () => {
      const res = render(<Started live since={now} />);
      expect(res.getByText("开始于 <1s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("开始于 <1s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("开始于 1s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("开始于 2s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("开始于 3s 前")).toBeInTheDocument();
    });

    it("应从可变偏移量递增", async () => {
      const res = render(<Started live since={now - 1500} />);
      expect(res.getByText("开始于 <1s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(499));
      expect(res.getByText("开始于 <1s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1));
      expect(res.getByText("开始于 1s 前")).toBeInTheDocument();
    });

    it("完成后应每分钟更新", async () => {
      const res = render(<Started live={false} since={now - 45_000} />);
      expect(res.getByText("开始于 45s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(5_000));
      expect(res.getByText("开始于 45s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(5_000));
      expect(res.getByText("开始于 45s 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(5_000));
      expect(res.getByText("开始于 1m 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(60_000));
      expect(res.getByText("开始于 2m 前")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(60_000));
      expect(res.getByText("开始于 3m 前")).toBeInTheDocument();
    });
  });

  describe("since", () => {
    const now = Date.now();

    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should increment by 1s when live", async () => {
      const res = render(<Since live since={now} />);
      expect(res.getByText("<1s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("<1s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("1s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("2s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("3s")).toBeInTheDocument();
    });

    it("should pause", async () => {
      const res = render(<Since live since={now} />);
      expect(res.getByText("<1s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("<1s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("1s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("2s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(999));
      expect(res.getByText("2s")).toBeInTheDocument();
      res.rerender(<Since live since={now} paused />);
      await act(() => vi.advanceTimersByTime(2));
      expect(res.getByText("2s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("2s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("2s")).toBeInTheDocument();
      res.rerender(<Since live since={now} />);
      expect(res.getByText("5s")).toBeInTheDocument();
      res.rerender(<Since live since={now} paused />);
      expect(res.getByText("5s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("5s")).toBeInTheDocument();
      res.rerender(<Since live since={now - 10_000} paused />);
      expect(res.getByText("16s")).toBeInTheDocument();
    });

    it("should update when since changes while paused", async () => {
      const res = render(<Since live since={now - 6_000} paused />);
      expect(res.getByText("5s")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1_000));
      expect(res.getByText("5s")).toBeInTheDocument();
      res.rerender(<Since live since={now - 10_000} paused />);
      expect(res.getByText("10s")).toBeInTheDocument();
    });
  });
});
