import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import UserContext from "../context/UserContext";

// Route guard. Waits for the login to be rehydrated from the saved token (`authReady`) before
// deciding, otherwise a page refresh would bounce a logged-in user (or admin) away.
export default function RequireAuth({ children, admin = false }) {
  const { user, authReady } = useContext(UserContext);

  if (!authReady) {
    return (
      <Container className="my-5 py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }
  if (user.id === null) return <Navigate to="/login" replace />;
  if (admin && user.isAdmin !== true) return <Navigate to="/" replace />;
  return children;
}

export const RequireAdmin = ({ children }) => <RequireAuth admin>{children}</RequireAuth>;
