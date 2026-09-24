import { formatAddress } from "../utils/address";

// A delivery address as short lines. Orders placed before addresses were saved have none, and say so.
export default function AddressBlock({ address, className = "" }) {
  const lines = formatAddress(address);
  if (lines.length === 0) {
    return <span className={`text-muted small ${className}`}>No address on file</span>;
  }
  return (
    <address className={`mb-0 small ${className}`}>
      {lines.map((line, i) => (
        <div key={i} className={i === 0 ? "fw-semibold" : undefined}>
          {line}
        </div>
      ))}
    </address>
  );
}
