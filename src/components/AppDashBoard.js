import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { Badge, Container, Form, FormControl, InputGroup } from "react-bootstrap";
import { useEffect, useState } from "react";
import Image from "react-bootstrap/Image";
import { Link, useNavigate } from "react-router-dom";
import { notyf, toastError } from "../utils/notify";
import { api } from "../utils/api";
import { stockState } from "../utils/stock";
import AddProductModal from "./AddProductModal";

const EDITABLE = ["name", "description", "price", "image", "stock"];
const NUMERIC = ["price", "stock"];

// Only the fields the admin actually changed, with numbers converted. Sending the whole product
// (as this page used to) would overwrite `stock` with the value from when the page loaded,
// erasing every sale made since.
export function changedFields(product, draft) {
  const changes = {};
  for (const field of EDITABLE) {
    if (draft[field] === undefined) continue;
    const before = String(product[field] ?? "");
    if (String(draft[field]) === before) continue;
    changes[field] = NUMERIC.includes(field) ? Number(draft[field]) : draft[field];
  }
  return changes;
}

function AppDashBoard() {
  const [products, setProducts] = useState([]);
  // Edits in progress, per product id: { [id]: { name?, price?, stock?, ... } }.
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState({});
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  async function fetchProducts() {
    try {
      const data = await api("/product/all", { emptyOn404: [] });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const valueOf = (product, field) =>
    drafts[product._id] && drafts[product._id][field] !== undefined
      ? drafts[product._id][field]
      : product[field] ?? "";

  function handleChange(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  const setBusyFor = (id, value) => setBusy((prev) => ({ ...prev, [id]: value }));

  async function handleUpdate(product) {
    const changes = changedFields(product, drafts[product._id] || {});
    if (Object.keys(changes).length === 0) return;
    setBusyFor(product._id, true);
    try {
      await api(`/product/${product._id}/update`, { method: "PATCH", body: changes });
      notyf.success("Product updated successfully!");
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      await fetchProducts();
    } catch (err) {
      toastError(err);
    } finally {
      setBusyFor(product._id, false);
    }
  }

  async function handleSwitch(product, checked) {
    setBusyFor(product._id, true);
    try {
      await api(`/product/${product._id}/${checked ? "activate" : "archive"}`, {
        method: "PATCH",
      });
      notyf.success(checked ? "Product has been activated!" : "Product has been archived!");
      await fetchProducts();
    } catch (err) {
      toastError(err);
    } finally {
      setBusyFor(product._id, false);
    }
  }

  const sortProducts = [...products].sort(
    (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
  );

  return (
    <>
      <Container className="my-5">
        <h1 className="d-flex justify-content-md-center pt-5 pb-3 fw-bolder">
          Admin Dashboard
        </h1>
        <div className="d-flex justify-content-md-center mb-5">
          <Button
            variant="light"
            className="btn btn-outline-dark me-3"
            onClick={handleShow}
          >
            Add New Product
          </Button>{" "}
          <Button
            as={Link}
            to="/admin/orders"
            variant="light"
            className="btn btn-outline-dark"
          >
            Show User Orders
          </Button>{" "}
        </div>
        <Table className="mb-5" hover>
          <thead>
            <tr>
              <th className="text-center">{}</th>
              <th className="text-center">Name</th>
              <th className="text-center">Description</th>
              <th className="text-center">Price</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Image Link</th>
              <th className="text-center">Availability</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortProducts.map((product) => {
              const dirty = Object.keys(changedFields(product, drafts[product._id] || {})).length > 0;
              const state = stockState(product.stock);
              return (
                <tr key={product._id}>
                  <td>
                    <Image
                      src={product.image}
                      width={70}
                      height={70}
                      roundedCircle
                      onClick={() => navigate(`/product/${product._id}`)}
                    />
                  </td>
                  <td>
                    <FormControl
                      type="text"
                      className="fw-bold"
                      value={valueOf(product, "name")}
                      onChange={(e) => handleChange(product._id, "name", e.target.value)}
                    />
                  </td>
                  <td>
                    <FormControl
                      type="text"
                      value={valueOf(product, "description")}
                      onChange={(e) => handleChange(product._id, "description", e.target.value)}
                    />
                  </td>
                  <td width={170}>
                    <InputGroup>
                      <InputGroup.Text>&#x20B1;</InputGroup.Text>
                      <FormControl
                        type="number"
                        min={1}
                        value={valueOf(product, "price")}
                        onChange={(e) => handleChange(product._id, "price", e.target.value)}
                      />
                    </InputGroup>
                  </td>
                  <td width={130}>
                    <FormControl
                      type="number"
                      min={0}
                      step={1}
                      aria-label={`Stock for ${product.name}`}
                      value={valueOf(product, "stock")}
                      onChange={(e) => handleChange(product._id, "stock", e.target.value)}
                    />
                    {state === "out" && (
                      <Badge bg="dark" className="mt-1">
                        Sold out
                      </Badge>
                    )}
                    {state === "low" && (
                      <Badge bg="warning" text="dark" className="mt-1">
                        Low stock
                      </Badge>
                    )}
                  </td>
                  <td>
                    <FormControl
                      value={valueOf(product, "image")}
                      onChange={(e) => handleChange(product._id, "image", e.target.value)}
                    />
                  </td>
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      id={`custom-switch-${product._id}`}
                      checked={product.isActive !== false}
                      disabled={!!busy[product._id]}
                      onChange={(e) => handleSwitch(product, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className="d-flex buttons">
                      <Button
                        variant="light"
                        className="btn btn-outline-dark mx-2"
                        title="Save changes"
                        disabled={!dirty || !!busy[product._id]}
                        onClick={() => handleUpdate(product)}
                      >
                        Save
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
      <AddProductModal show={showModal} onHide={handleClose} refresh={fetchProducts} />
    </>
  );
}

export default AppDashBoard;
