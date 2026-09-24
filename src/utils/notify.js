import { Notyf } from "notyf";

// A single shared Notyf. Creating one per component render appended a new container to
// document.body every time (and the cart page re-rendered constantly), leaking DOM nodes.
export const notyf = new Notyf({
  duration: 4000,
  types: [
    { type: "warning", background: "#f0ad4e", icon: false },
    { type: "info", background: "#0dcaf0", icon: false },
  ],
});

export const toastError = (err) =>
  notyf.error(err && err.message ? err.message : "Something went wrong. Please try again.");
