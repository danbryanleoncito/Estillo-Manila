// Delivery address. The server (backend/utils/address.js) validates and normalises it; these
// mirror its rules so the form can say what is wrong before anything is sent.

export const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Philippines",
};

// HTML `pattern` values (the browser applies them to the fields).
export const PHONE_PATTERN = "^(09|\\+639)[0-9 \\-]{9,14}$";
export const POSTAL_PATTERN = "^[0-9]{4}$";

// An address as display lines, skipping anything blank. Orders placed before addresses were saved
// have none, so a missing address gives an empty list.
export function formatAddress(address) {
  if (!address || typeof address !== "object") return [];
  const cityLine = [address.city, address.province, address.postalCode].filter(Boolean).join(", ");
  return [address.fullName, address.phone, address.addressLine1, address.addressLine2, cityLine, address.country].filter(
    (line) => typeof line === "string" && line.trim() !== ""
  );
}

export const hasAddress = (address) => formatAddress(address).length > 0;
