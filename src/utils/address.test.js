import { EMPTY_ADDRESS, formatAddress, hasAddress, PHONE_PATTERN, POSTAL_PATTERN } from "./address";

const full = {
  fullName: "Ada Lovelace",
  phone: "09171234567",
  addressLine1: "12 Rizal Street",
  addressLine2: "Unit 4B",
  city: "Makati",
  province: "Metro Manila",
  postalCode: "1200",
  country: "Philippines",
};

test("formats a full address as lines", () => {
  expect(formatAddress(full)).toEqual([
    "Ada Lovelace",
    "09171234567",
    "12 Rizal Street",
    "Unit 4B",
    "Makati, Metro Manila, 1200",
    "Philippines",
  ]);
});

test("leaves out blank parts", () => {
  expect(formatAddress({ ...full, addressLine2: "", postalCode: "" })).toEqual([
    "Ada Lovelace",
    "09171234567",
    "12 Rizal Street",
    "Makati, Metro Manila",
    "Philippines",
  ]);
});

test("an order from before addresses were saved has no lines", () => {
  for (const missing of [undefined, null, "", 5]) {
    expect(formatAddress(missing)).toEqual([]);
    expect(hasAddress(missing)).toBe(false);
  }
  expect(hasAddress(full)).toBe(true);
});

test("the empty form starts in the Philippines with everything else blank", () => {
  expect(EMPTY_ADDRESS.country).toBe("Philippines");
  expect(Object.entries(EMPTY_ADDRESS).filter(([k, v]) => k !== "country" && v !== "")).toEqual([]);
});

test("the phone pattern takes exactly the numbers the server takes", () => {
  // The browser compiles `pattern` with the "v" flag, so test it that way.
  const phone = new RegExp(PHONE_PATTERN, "v");
  const accepted = [
    "09171234567",
    "0917 123 4567",
    "0917-123-4567",
    "+639171234567",
    "+63 917 123 4567",
    "+63-917-123-4567",
    "+63 9171234567",
    " 09171234567 ",
    "+ 63 917 123 4567",
    "09 17 12 34 567",
  ];
  const refused = ["", "12345", "08171234567", "917123456", "abc", "639171234567", "091712345678", "0917 123 45678", "+63 817 123 4567"];
  for (const ok of accepted) expect([ok, phone.test(ok)]).toEqual([ok, true]);
  for (const bad of refused) expect([bad, phone.test(bad)]).toEqual([bad, false]);
});

test("the postal code pattern is exactly four digits", () => {
  const postal = new RegExp(POSTAL_PATTERN);
  expect(postal.test("1200")).toBe(true);
  for (const bad of ["", "12", "12345", "12ab"]) expect(postal.test(bad)).toBe(false);
});
