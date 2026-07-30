import { describe, expect, it } from "vitest";
import { parseDurationImportText } from "./duration-import";

const copiedDurationData = JSON.stringify([
  {
    id: "83764c71-2191-468a-b73d-a1fc7fce3e67",
    name: "Suica's birthday",
    date: "1996-04-22T23:00:00.000Z",
    repeat: "year",
    type: "birthday",
  },
  {
    id: "7e927e74-8d89-445c-b14e-72319c0052ed",
    name: "Violet's birthday",
    date: "1995-08-01T23:00:00.000Z",
    repeat: "year",
    type: "birthday",
  },
  {
    id: "53fe26c7-2a0a-44cf-99d5-453814e39f10",
    name: "Council tax",
    date: "2024-11-05T00:00:00.000Z",
    repeat: "month",
    type: "bills",
  },
  {
    id: "f331e655-0323-41c1-b513-80b6f12b469b",
    name: "Nekopen",
    date: "2022-11-03T00:00:00.000Z",
    repeat: "year",
    type: "anniversary",
  },
  {
    id: "56b1579e-7234-481f-8e17-5e0355e68cdc",
    name: "Marriage",
    date: "2023-05-10T23:00:00.000Z",
    repeat: "year",
    type: "anniversary",
  },
  {
    id: "7fe9118a-9c4c-47f4-a0e2-e2e65f8a3bf6",
    name: "Shinjuku Penguin",
    date: "2001-11-18T00:00:00.000Z",
    repeat: "year",
    type: "birthday",
  },
  {
    id: "7b115c33-55d4-4a4f-b6e2-ac674339c7a1",
    name: "Report Vesynta to ICO",
    date: "2025-10-06T23:00:00.000Z",
    repeat: "never",
    type: "none",
  },
  {
    id: "7dd690b3-77c1-46c4-8add-d1db5bc68baa",
    name: "Vesynta ET3",
    date: "2025-10-08T23:00:00.000Z",
    repeat: "never",
    type: "none",
  },
  {
    id: "c1a6b851-e37e-447d-9f78-a825fb002f50",
    name: "Leave the UK",
    date: "2025-11-01T00:00:00.000Z",
    repeat: "never",
    type: "none",
  },
]);

describe("parseDurationImportText", () => {
  it("accepts the copied multi-date payload", () => {
    const widgets = parseDurationImportText(copiedDurationData);

    expect(widgets).toHaveLength(9);
    expect(widgets[0]).toMatchObject({
      name: "Suica's birthday",
      repeat: "year",
      type: "birthday",
    });
    expect(widgets[0].date).toBeInstanceOf(Date);
  });

  it("normalises a single copied date into an array", () => {
    const [firstWidget] = JSON.parse(copiedDurationData);

    expect(parseDurationImportText(JSON.stringify(firstWidget))).toHaveLength(
      1,
    );
  });
});
