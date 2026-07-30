import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import DevicesList from "@/pages/devices/DevicesList";
import DeviceDetail from "@/pages/devices/DeviceDetail";
import LiveMap from "@/pages/map/LiveMap";
import Policies from "@/pages/policies/Policies";
import Alerts from "@/pages/alerts/Alerts";
import Logs from "@/pages/logs/Logs";
import Users from "@/pages/users/Users";
import Organization from "@/pages/org/Organization";
import Settings from "@/pages/settings/Settings";
import WhatsAppPage from "@/pages/whatsapp/WhatsAppPage";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/devices" element={<DevicesList />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/whatsapp" element={<WhatsAppPage />} />
          <Route path="/map" element={<LiveMap />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<ProtectedRoute roles={["ADMIN", "SUPERVISOR"]} />}>
            <Route path="/logs" element={<Logs />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
