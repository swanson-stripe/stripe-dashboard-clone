import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useMatch } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import MetricDetail from './pages/MetricDetail';
import MetricEditor from './pages/MetricEditor';
import EmptyPage from './pages/EmptyPage';
import BillingOverview from './pages/BillingOverview';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/App.css';
import styled from 'styled-components';

const MainSection = styled.div`
  margin-left: 64px;
  width: calc(100% - 64px);
  height: 100vh;
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;
`;

// Component to handle document title updates
const DocumentTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Get page name based on current path
    let pageTitle = "Stripe Dashboard";
    
    // Extract page name from path
    const path = location.pathname;
    
    if (path === "/") {
      pageTitle = "Home - Stripe Dashboard";
    } else if (path.startsWith("/metrics/") && path.includes("/edit")) {
      pageTitle = "Edit Metric - Stripe Dashboard";
    } else if (path.startsWith("/metrics/")) {
      pageTitle = "Metric Details - Stripe Dashboard";
    } else if (path.startsWith("/billing/overview")) {
      pageTitle = "Billing - Stripe Dashboard";
    } else if (path.startsWith("/billing/")) {
      // Extract the section name after /billing/
      const section = path.split("/")[2];
      pageTitle = `${section.charAt(0).toUpperCase() + section.slice(1)} - Stripe Dashboard`;
    } else {
      // For other pages, extract the last segment of the path
      const segments = path.split("/").filter(segment => segment);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        pageTitle = `${lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)} - Stripe Dashboard`;
      }
    }
    
    // Update document title
    document.title = pageTitle;
  }, [location]);
  
  return null; // This component doesn't render anything
};

function App() {
  const location = useLocation();
  const isEditorRoute = useMatch('/metrics/:metricId/edit');

  return (
    <div className="app">
      <DocumentTitle />
      {!isEditorRoute && <Sidebar />}
      <div className={`main-content ${isEditorRoute ? 'fullscreen' : ''}`}>
        {!isEditorRoute && <Header />}
        <LayoutGroup>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              
              {/* Metrics Routes */}
              <Route path="/metrics/:metricId" element={<MetricDetail />} />
              <Route path="/metrics/:metricId/edit" element={<MetricEditor />} />
              <Route path="/metric/:metricId" element={<MetricDetail />} />
              
              {/* Main Menu */}
              <Route path="/balances" element={<EmptyPage title="Balances" />} />
              <Route path="/transactions" element={<EmptyPage title="Transactions" />} />
              <Route path="/customers" element={<EmptyPage title="Customers" />} />
              <Route path="/products" element={<EmptyPage title="Product Catalog" />} />
              
              {/* Shortcuts */}
              <Route path="/sigma" element={<EmptyPage title="Sigma" />} />
              <Route path="/billing-overview" element={<EmptyPage title="Billing Overview" />} />
              <Route path="/meters" element={<EmptyPage title="Meters" />} />
              <Route path="/subscriptions" element={<EmptyPage title="Subscriptions" />} />
              <Route path="/reports" element={<EmptyPage title="Reports" />} />
              
              {/* Products */}
              <Route path="/connect" element={<EmptyPage title="Connect" />} />
              <Route path="/payments" element={<EmptyPage title="Payments" />} />
              <Route path="/billing-product" element={<EmptyPage title="Billing" />} />
              <Route path="/reporting" element={<EmptyPage title="Reporting" />} />
              <Route path="/more" element={<EmptyPage title="More" />} />
              
              {/* Bottom */}
              <Route path="/developers" element={<EmptyPage title="Developers" />} />
              <Route path="/settings" element={<EmptyPage title="Settings" />} />
              
              {/* Billing routes */}
              <Route path="/billing/overview" element={<BillingOverview />} />
              <Route path="/billing/subscriptions" element={<EmptyPage title="Subscriptions" />} />
              <Route path="/billing/invoices" element={<EmptyPage title="Invoices" />} />
              <Route path="/billing/usage-based" element={<EmptyPage title="Usage-based Billing" />} />
              <Route path="/billing/revenue-recovery" element={<EmptyPage title="Revenue Recovery" />} />
              
              {/* Fallback route for any other paths */}
              <Route path="*" element={<EmptyPage title="Page Not Found" subtitle="The page you're looking for doesn't exist." />} />
            </Routes>
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
}

export default App; 