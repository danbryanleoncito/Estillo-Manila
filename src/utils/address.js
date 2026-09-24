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
// The phone pattern accepts the same numbers the server does: 09XXXXXXXXX or +639XXXXXXXXX, with
// spaces or dashes anywhere ("+63 917 123 4567", "0917-123-4567"). The first version did not allow
// a space after "+63", so a valid number typed that way was rejected by the form.
export const PHONE_PATTERN = "^[\\s\\-]*(\\+[\\s\\-]*63|0)[\\s\\-]*9([\\s\\-]*[0-9]){9}[\\s\\-]*$";
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
