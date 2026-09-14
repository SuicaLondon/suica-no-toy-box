import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { ToyThemeToggle } from "./toy-theme-toggle";

const theme = vi.hoisted(() => ({
  resolvedTheme: undefined as string | undefined,
  setTheme: vi.fn(),
}));
vi.mock("next-themes", () => ({ useTheme: () => theme }));

it("hydrates a stored dark preference without replacing the server-rendered toggle", async () => {
  theme.resolvedTheme = undefined;
  const toggle = (
    <ToyThemeToggle
      switchToDarkLabel="Dark mode"
      switchToLightLabel="Light mode"
    />
  );
  const container = document.createElement("div");
  container.innerHTML = renderToString(toggle);
  document.body.append(container);
  const serverButton = container.querySelector("button");
  theme.resolvedTheme = "dark";
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, toggle, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector("button")).toBe(serverButton);
    expect(serverButton).toHaveAttribute("aria-label", "Light mode");
    expect(serverButton).toHaveAttribute("aria-pressed", "true");
  } finally {
    await act(async () => root?.unmount());
    container.remove();
    theme.resolvedTheme = undefined;
  }
});
