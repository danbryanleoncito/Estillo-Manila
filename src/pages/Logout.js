import { useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";

import UserContext from "../context/UserContext";

export default function Logout() {
  const { setUser, unsetUser } = useContext(UserContext);

  // Side effects belong in an effect, not in render (this used to clear storage on every render).
  useEffect(() => {
    unsetUser();
    setUser({
      id: null,
      isAdmin: null,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <Navigate to="/login" />;
}
