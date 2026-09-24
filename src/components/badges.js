import { Badge } from "react-bootstrap";

// One place for the colour rules that used to be copied into every order table.
const PAYMENT = { Paid: "success", Failed: "danger", COD: "secondary" };

export function PaymentBadge({ status }) {
  return <Badge bg={PAYMENT[status] || "warning"}>{status || "Unpaid"}</Badge>;
}

const LINE = {
  Fulfilled: { bg: "success", label: "Fulfilled" },
  Disputed: { bg: "warning", text: "dark", label: "Needs your decision" },
  Adjusted: { bg: "info", text: "dark", label: "Quantity adjusted" },
  Cancelled: { bg: "secondary", label: "Cancelled" },
};

export function LineStatusBadge({ status }) {
  const style = LINE[status] || LINE.Fulfilled;
  return (
    <Badge bg={style.bg} text={style.text}>
      {style.label}
    </Badge>
  );
}
