import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import clsx from 'clsx';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transfers from './pages/Transfers';
import History from './pages/History';
import Cards from './pages/Cards';
import Limits from './pages/Limits';
import Admin from './pages/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/accounts" element={<Accounts />} />
            <Route path="/dashboard/transfers" element={<Transfers />} />
            <Route path="/dashboard/history" element={<History />} />
            <Route path="/dashboard/cards" element={<Cards />} />
            <Route path="/dashboard/limits" element={<Limits />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Router>
      <div className={clsx(
        "min-h-screen w-full transition-colors duration-1000 ease-in-out font-sans",
        isDark ? "bg-black text-white" : "bg-white text-[#222222]" 
      )}>
        <AnimatedRoutes />
      </div>
    </Router>
  );
}
