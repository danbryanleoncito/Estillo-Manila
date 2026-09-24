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

test("the phone pattern takes 09… and +639… numbers, with spaces or dashes, and nothing else", () => {
  const phone = new RegExp(PHONE_PATTERN);
  for (const ok of ["09171234567", "0917 123 4567", "0917-123-4567", "+639171234567", "+63 917 123 4567".replace("+63 9", "+639")]) {
    expect(phone.test(ok)).toBe(true);
  }
  for (const bad of ["", "12345", "08171234567", "917123456", "abc"]) {
    expect(phone.test(bad)).toBe(false);
  }
});

test("the postal code pattern is exactly four digits", () => {
  const postal = new RegExp(POSTAL_PATTERN);
  expect(postal.test("1200")).toBe(true);
  for (const bad of ["", "12", "12345", "12ab"]) expect(postal.test(bad)).toBe(false);
});
