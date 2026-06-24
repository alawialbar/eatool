import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ConfirmAccount } from "@/pages/ConfirmAccount";
import { Dashboard } from "@/pages/Dashboard";
import { ApplicationList } from "@/pages/applications/ApplicationList";
import { ApplicationDetail } from "@/pages/applications/ApplicationDetail";
import { BusinessCapabilityList } from "@/pages/business-capabilities/BusinessCapabilityList";
import { BusinessCapabilityDetail } from "@/pages/business-capabilities/BusinessCapabilityDetail";
import { TechnologyComponentList } from "@/pages/technology-components/TechnologyComponentList";
import { TechnologyComponentDetail } from "@/pages/technology-components/TechnologyComponentDetail";
import { DataObjectList } from "@/pages/data-objects/DataObjectList";
import { DataObjectDetail } from "@/pages/data-objects/DataObjectDetail";
import { IntegrationList } from "@/pages/integrations/IntegrationList";
import { IntegrationDetail } from "@/pages/integrations/IntegrationDetail";
import { LandscapeMatrix } from "@/pages/LandscapeMatrix";
import { IntegrationMap } from "@/pages/IntegrationMap";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm" element={<ConfirmAccount />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/applications" element={<ApplicationList />} />
              <Route
                path="/applications/:id"
                element={<ApplicationDetail />}
              />
              <Route
                path="/business-capabilities"
                element={<BusinessCapabilityList />}
              />
              <Route
                path="/business-capabilities/:id"
                element={<BusinessCapabilityDetail />}
              />
              <Route
                path="/technology-components"
                element={<TechnologyComponentList />}
              />
              <Route
                path="/technology-components/:id"
                element={<TechnologyComponentDetail />}
              />
              <Route path="/data-objects" element={<DataObjectList />} />
              <Route path="/data-objects/:id" element={<DataObjectDetail />} />
              <Route path="/integrations" element={<IntegrationList />} />
              <Route
                path="/integrations/:id"
                element={<IntegrationDetail />}
              />
              <Route path="/landscape" element={<LandscapeMatrix />} />
              <Route path="/integration-map" element={<IntegrationMap />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
