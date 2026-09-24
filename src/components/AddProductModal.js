import { useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { notyf, toastError } from "../utils/notify";
import { api } from "../utils/api";

export default function AddProductModal({ show, onHide, refresh }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("0");

  async function addProduct(e) {
    e.preventDefault();
    const productDetails = {
      name,
      description,
      image,
      price: Number(price),
      stock: Number(stock),
    };
    try {
      // Failures (duplicate name, invalid stock, not an admin) now show the server's message
      // instead of "Product added successful".
      await api("/product", { method: "POST", body: productDetails });
      notyf.success("Product added successful");

      setName("");
      setDescription("");
      setPrice("");
      setImage("");
      setStock("0");

      refresh();
      onHide();
    } catch (err) {
      toastError(err);
    }
  }

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Form onSubmit={addProduct}>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter ">
              <h3 className="fw-bolder">Add Product</h3>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="my-2" as={Row}>
              <Form.Group as={Col} md="12">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
            </Form.Group>
            <Form.Group className="my-2" as={Row}>
              <Form.Group as={Col} md="12">
                <Form.Label>Product Description</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  placeholder="Product Description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
            </Form.Group>
            <Form.Group className="my-2" as={Row}>
              <Form.Group as={Col} md="12">
                <Form.Label>Image Link</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Image Link"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </Form.Group>
            </Form.Group>
            <Form.Group className="my-2" as={Row}>
              <Form.Group as={Col} md="6">
                <Form.Label>Price</Form.Label>
                <InputGroup>
                  <InputGroup.Text>&#x20B1;</InputGroup.Text>
                  <Form.Control
                    required
                    type="number"
                    placeholder="Price"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group as={Col} md="6">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  required
                  type="number"
                  placeholder="Units in stock"
                  min={0}
                  step={1}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                <Form.Text className="text-muted">
                  0 lists the product as sold out until restocked.
                </Form.Text>
              </Form.Group>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-dark" onClick={onHide}>
              Close
            </Button>
            <Button className="btn-dark" type="submit" id="submitBtn">
              Add Product
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
