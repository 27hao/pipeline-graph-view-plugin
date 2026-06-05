import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserPreferencesProvider } from "../../../common/user/user-preferences-provider";
import SettingsButton from "./settings-button.tsx";

describe("SettingsButton", () => {
  const createButtonPortal = () => {
    const div = document.createElement("div");
    div.setAttribute("id", "button-portal");
    document.body.appendChild(div);
    return div;
  };

  const renderComponent = (buttonPortal: HTMLElement) => {
    return render(
      <UserPreferencesProvider>
        <SettingsButton buttonPortal={buttonPortal} />
      </UserPreferencesProvider>,
    );
  };

  it("should render settings button in portal", () => {
    const buttonPortal = createButtonPortal();
    renderComponent(buttonPortal);

    expect(screen.getByText("设置")).toBeTruthy();
  });

  it("should toggle dropdown when clicking settings button", async () => {
    const buttonPortal = createButtonPortal();
    renderComponent(buttonPortal);

    const settingsButton = screen.getByText("设置");
    fireEvent.click(settingsButton!);

    expect(screen.getByText("显示阶段名称")).toBeInTheDocument();
    expect(screen.getByText("显示阶段持续时间")).toBeInTheDocument();
  });

  it("should update preferences when toggling checkboxes", () => {
    const buttonPortal = createButtonPortal();
    renderComponent(buttonPortal);

    const settingsButton = screen.getByText("设置");
    fireEvent.click(settingsButton);

    const showNamesCheckbox = screen.getByLabelText("显示阶段名称");
    fireEvent.click(showNamesCheckbox);
    expect(showNamesCheckbox).toBeChecked();

    const showDurationsCheckbox = screen.getByLabelText("显示阶段持续时间");
    fireEvent.click(showDurationsCheckbox);
    expect(showDurationsCheckbox).toBeChecked();
  });
});
