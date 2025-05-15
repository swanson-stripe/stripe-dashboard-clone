import React from 'react';
import { Routes, Route, useLocation, useMatch } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import MetricDetail from './pages/MetricDetail';
import MetricEditor from './pages/MetricEditor';
import EmptyPage from './pages/EmptyPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/App.css';

function App() {
  const location = useLocation();
  const isEditorRoute = useMatch('/metrics/:metricId/edit');

  return (
    <div className="app">
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
            </Routes>
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
}

export default App; 