import React, { useEffect, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SideNavBar } from './sidenavebar'; // Corrected import path
import { ActiveStepContext } from '../context/ActiveStepContext';

const MainLayout = () => {
  const { activeStep, setActiveStep } = useContext(ActiveStepContext);
  const location = useLocation();

  // This effect synchronizes the active step with the current browser URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/historyPage') {
      setActiveStep(1);
    } else if (path === '/') {
      setActiveStep(0);
    }
    // Add other routes here if you have more steps
  }, [location, setActiveStep]);

  return (
    <div>
      {/* SideNavBar now gets its activeStep from the context, which is controlled by the URL */}
      <SideNavBar activeStep={activeStep} />
      <main>
        {/* The Outlet renders the current route's component (UploadExcel or HistoryPage) */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;