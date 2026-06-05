/** * @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StagesCustomization from "./stages-customization.tsx";

const {
  mockSetMainViewVisibility,
  mockSetStageViewPosition,
  mockUseLayoutPreferences,
} = vi.hoisted(() => ({
  mockSetMainViewVisibility: vi.fn(),
  mockSetStageViewPosition: vi.fn(),
  mockUseLayoutPreferences: vi.fn(),
}));

vi.mock("../providers/user-preference-provider.tsx", () => ({
  useLayoutPreferences: mockUseLayoutPreferences.mockReturnValue({
    mainViewVisibility: "both",
    setMainViewVisibility: mockSetMainViewVisibility,
    stageViewPosition: "top",
    setStageViewPosition: mockSetStageViewPosition,
    isMobile: false,
  }),
  MainViewVisibility: {
    BOTH: "both",
    GRAPH_ONLY: "graphOnly",
    STAGES_ONLY: "stagesOnly",
  },
  StageViewPosition: {
    TOP: "top",
    LEFT: "left",
  },
}));

describe("StagesCustomization", () => {
  it("应该渲染视图和图表位置控件", () => {
    render(<StagesCustomization />);

    expect(screen.getByText("视图")).toBeInTheDocument();
    expect(screen.getByText("图表位置")).toBeInTheDocument();
  });

  it("应该显示当前值", () => {
    render(<StagesCustomization />);

    expect(screen.getAllByText("图表和阶段").length).toBeGreaterThan(0);
    expect(screen.getAllByText("顶部").length).toBeGreaterThan(0);
  });

  it("选择时应改变视图可见性", () => {
    render(<StagesCustomization />);

    const viewsSelect = document.getElementById(
      "main-view-visibility",
    ) as HTMLSelectElement;
    fireEvent.change(viewsSelect, { target: { value: "graphOnly" } });
    expect(mockSetMainViewVisibility).toHaveBeenCalledWith("graphOnly");
  });

  it("选择时应改变图表位置", () => {
    render(<StagesCustomization />);

    const positionSelect = document.getElementById(
      "stage-view-position",
    ) as HTMLSelectElement;
    fireEvent.change(positionSelect, { target: { value: "left" } });
    expect(mockSetStageViewPosition).toHaveBeenCalledWith("left");
  });

  it("移动端应返回 null", () => {
    mockUseLayoutPreferences.mockReturnValueOnce({
      mainViewVisibility: "both",
      setMainViewVisibility: vi.fn(),
      stageViewPosition: "top",
      setStageViewPosition: vi.fn(),
      isMobile: true,
    });

    const { container } = render(<StagesCustomization />);
    expect(container.innerHTML).toBe("");
  });
});
