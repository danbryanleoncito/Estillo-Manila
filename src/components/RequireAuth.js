import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import UserContext from "../context/UserContext";
import LoadError from "./LoadError";

// Route guard. Waits for the login to be rehydrated from the saved token (`authReady`) before
// deciding, otherwise a page refresh would bounce a logged-in user (or admin) away.
export default function RequireAuth({ children, admin = false }) {
  const { user, authReady, authError, retryAuth } = useContext(UserContext);

  if (!authReady) {
    return (
      <Container className="my-5 py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }
  // The saved login could not be checked (server unreachable). Say so, rather than sending a
  // logged-in user to /login as if they had never signed in.
  if (user.id === null && authError) {
    return (
      <Container className="my-5 py-5">
        <LoadError
          message="We cannot reach the server, so we could not confirm you are logged in."
          onRetry={retryAuth}
        />
      </Container>
    );
  }
  if (user.id === null) return <Navigate to="/login" replace />;
  if (admin && user.isAdmin !== true) return <Navigate to="/" replace />;
  return children;
}

export const RequireAdmin = ({ children }) => <RequireAuth admin>{children}</RequireAuth>;
