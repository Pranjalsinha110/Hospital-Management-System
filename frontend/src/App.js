import './App.css';
import { useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/Approutes";
import AIAssistant from "./components/Ai/AIAssistant";
import { AuthProvider } from "./context/Authcontext";

function AppContent() {
  const location = useLocation();

  const isDashboardPage =
    location.pathname.startsWith("/patient") ||
    location.pathname.startsWith("/doctor") ||
    location.pathname.startsWith("/admin");

  return (
    <div className="App">
      <Navbar />

      <main className="app-content">
        <AppRoutes />
      </main>

      {!isDashboardPage && <Footer />}
      <AIAssistant />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;