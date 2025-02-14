import { useEffect } from "react";
import { Router } from "./Router";
import { useAuthStore } from "./stores/auth.store";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <Router />;
}

export default App;
