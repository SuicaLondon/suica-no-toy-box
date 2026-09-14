import {
  cleanup,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ToolI18nProvider } from "@/i18n/tool-i18n";
import { useDurationStore } from "../../stores/duration.store";
import { AddDurationButton } from ".";

const initialState = useDurationStore.getState();

const dialogPrototype = HTMLDialogElement.prototype;
const originalShowModal = Object.getOwnPropertyDescriptor(
  dialogPrototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, "close");

beforeEach(() => {
  // jsdom does not implement the native dialog lifecycle.
  Object.defineProperty(dialogPrototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(dialogPrototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
});

afterEach(() => {
  cleanup();
  useDurationStore.setState(initialState, true);
  if (originalShowModal)
    Object.defineProperty(dialogPrototype, "showModal", originalShowModal);
  else Reflect.deleteProperty(dialogPrototype, "showModal");
  if (originalClose)
    Object.defineProperty(dialogPrototype, "close", originalClose);
  else Reflect.deleteProperty(dialogPrototype, "close");
  vi.restoreAllMocks();
});

it("validates and submits native selects with the birthday repeat rule", async () => {
  const addWidget = vi.fn();
  useDurationStore.setState({ addWidget });
  const user = userEvent.setup();
  render(
    <ToolI18nProvider locale="en">
      <AddDurationButton />
    </ToolI18nProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Add date" });
  await user.click(trigger);
  const dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("button", { name: "Add date" }));
  expect(dialog.getByRole("textbox", { name: "Name" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(addWidget).not.toHaveBeenCalled();
  await user.type(
    dialog.getByRole("textbox", { name: "Name" }),
    "Birthday test",
  );
  await user.selectOptions(
    dialog.getByRole("combobox", { name: "Type" }),
    "birthday",
  );
  expect(dialog.getByRole("combobox", { name: "Repeat" })).toBeDisabled();
  expect(dialog.getByRole("combobox", { name: "Repeat" })).toHaveValue("year");
  await user.click(dialog.getByRole("button", { name: "Add date" }));
  await waitFor(() =>
    expect(addWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Birthday test",
        type: "birthday",
        repeat: "year",
        date: expect.any(Date),
      }),
    ),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
