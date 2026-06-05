import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UserPreferencesProvider } from "../../../common/user/user-preferences-provider";
import OverflowDropdown from "./overfow-dropdown.tsx";

vi.mock("../../../common/user/user-permission-provider.tsx", () => ({
  useUserPermissions: () => ({ canConfigure: true }),
}));

describe("OverflowDropdown", () => {
  const createButtonPortal = () => {
    const div = document.createElement("div");
    div.setAttribute("id", "overflow-portal");
    document.body.appendChild(div);
    return div;
  };

  const renderComponent = (buttonPortal: HTMLElement) => {
    return render(
      <UserPreferencesProvider>
        <OverflowDropdown buttonPortal={buttonPortal} />
      </UserPreferencesProvider>,
    );
  };

  it("should render dropdown button", () => {
    const portal = createButtonPortal();
    renderComponent(portal);
    expect(screen.getByText("更多操作")).toBeTruthy();
  });

  it("should show all checkboxes when opened", () => {
    const portal = createButtonPortal();
    renderComponent(portal);

    fireEvent.click(screen.getByText("更多操作"));

    expect(screen.getByLabelText("显示阶段名称")).toBeInTheDocument();
    expect(screen.getByLabelText("显示阶段持续时间")).toBeInTheDocument();
  });

  it("当用户有配置权限时应显示配置链接", () => {
    const portal = createButtonPortal();
    renderComponent(portal);

    fireEvent.click(screen.getByText("更多操作"));
    expect(screen.getByText("配置")).toBeInTheDocument();
  });
});
