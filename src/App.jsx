import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./landingpage/homepage";

// Sidebar imports
import ParishSidebar from "./sidebar/parishsidebar";
import CommunitySidebar from "./sidebar/communitysidebar";
import SecretarySidebar from "./sidebar/secretarysidebar";
import ClientSidebar from "./sidebar/clientsidebar";


import CommunityDashboard from "./community/communitydashboard";
import CommunityProfile from "./community/communityprofile";
import CommunityActivitiesEvent from "./community/communityactivitiesevent";

import ParishDashboard from "./parish/parishdashboard";
import ParishAppointment from "./parish/parishappointment";
import ParishActivitiesEvent from "./parish/parishactivitiesevent";
import BaptismView from "./parish/baptismview";
import MarriageView from "./parish/marriageview";
import FuneralMassView from "./parish/funeralmassview";
import ConfirmationView from "./parish/confirmationview";
import CommunionView from "./parish/communionview";
import BlessingView from "./parish/blessingview";

import SecretaryDashboard from "./secretary/secretarydashboard";
import SecretarySchedule from "./secretary/secretaryschedule";
import SecretaryAppointment from "./secretary/secretaryappointment";
import SecretaryActivitiesEvent from "./secretary/secretaryactivitiesevent";
import SecretaryPayment from "./secretary/secretarypayment";
import SecretaryReport from "./secretary/secretaryreport";
import SecretaryUserManagement from "./secretary/secretaryusermanagement";
import SecretaryBaptism from "./secretary/secretarybaptism";
import SecretaryMarriage from "./secretary/secretarymarriage";
import SecretaryFuneralMass from "./secretary/secretaryfuneralmass";
import SecretaryBlessing from "./secretary/secretaryblessing";
import SecretaryConfirmation from "./secretary/secretaryconfirmation";
import SecretaryCommunion from "./secretary/secretarycommunion";
import SecretaryBaptismView from "./secretary/secretarybaptismview";
import SecretaryConfirmationView from "./secretary/secretaryconfirmationview";
import SecretaryMarriageView from "./secretary/secretarymarriageview";
import SecretaryCommunionView from "./secretary/secretarycommunionview";
import SecretaryFuneralMassView from "./secretary/secretaryfuneralmassview";
import SecretaryBlessingView from "./secretary/secretaryblessingview";



import ClientDashboard from "./client/clientdashboard";
import ClientProfile from "./client/clientprofile";
import ClientAppointment from "./client/clientappointment";
import ClientBaptism from "./client/clientbaptism";
import ClientMarriage from "./client/clientmarriage";
import ClientKumpil from "./client/clientkumpil";
import ClientCommunion from "./client/clientcommunion";
import ClientFuneralMass from "./client/clientfuneralmass";
import ClientBlessing from "./client/clientblessing";
import ClientBaptismView from "./client/clientbaptismview";
import ClientMarriageView from "./client/clientmarriageview";
import ClientCommunionView from "./client/clientcommunionview";
import ClientKumpilView from "./client/clientkumpilview";
import ClientBlessingView from "./client/clientblessingview";
import ClientFuneralMassView from "./client/clientfuneralmassview";

import "./App.css";

// Main Page Component
const MainPage = () => {
  const location = useLocation();

  const isCommunityRoute = location.pathname.startsWith("/community");
  const isSecretaryRoute = location.pathname.startsWith("/secretary");
  const isClientRoute = location.pathname.startsWith("/client");
  
  // Helper function to determine which sidebar to show based on route and state
  const getSidebar = () => {
    // Check if we're on a view page and check the state source
    if (location.pathname === "/baptism-view" || 
        location.pathname === "/marriage-view" || 
        location.pathname === "/funeral-mass-view" || 
        location.pathname === "/confirmation-view" || 
        location.pathname === "/communion-view" || 
        location.pathname === "/blessing-view") {
      
      // Check location state for source information
      const source = location.state?.source;
      
      if (source === "secretary") {
        return <SecretarySidebar />;
      } else if (source === "parish") {
        return <ParishSidebar />;
      } else {
        // Default fallback if no source is specified
        return <ParishSidebar />;
      }
    }
    
    // For non-view routes, use the standard logic
    if (isCommunityRoute) {
      return <CommunitySidebar />;
    } else if (isSecretaryRoute) {
      return <SecretarySidebar />;
    } else if (isClientRoute) {
      return <ClientSidebar />;
    } else {
      return <ParishSidebar />;
    }
  };

  return (
    <div className="main-container">
      <div className="sidebar-container">
      <div className="logo-container">
  <img src="/src/assets/pdmlogo.png" alt="Parish Logo" className="sidebar-logo" />
  <div className="logo-text">
    <h1 className="logo-title">PARISH OF THE DIVINE MERCY</h1>
    <h2 className="logo-subtitle">Management Information System</h2>
  </div>
</div>

        {getSidebar()}
      </div>
      <div className="form-container">
        {location.pathname === "/parish-dashboard" ? <ParishDashboard />
        : location.pathname === "/parish-appointment" ? <ParishAppointment />
        : location.pathname === "/parish-activities-event" ? <ParishActivitiesEvent />
        : location.pathname === "/baptism-view" ? <BaptismView />
        : location.pathname === "/marriage-view" ? <MarriageView/>
        : location.pathname === "/funeral-mass-view" ? <FuneralMassView/>
        : location.pathname === "/confirmation-view" ? <ConfirmationView/>
        : location.pathname === "/communion-view" ? <CommunionView/>
        : location.pathname === "/blessing-view" ? <BlessingView/>

        : location.pathname === "/community-dashboard" ? <CommunityDashboard />
        : location.pathname === "/community-profile" ? <CommunityProfile />
        : location.pathname === "/community-activities-event" ? <CommunityActivitiesEvent />

        : location.pathname === "/secretary-dashboard" ? <SecretaryDashboard />
        : location.pathname === "/secretary-schedule" ? <SecretarySchedule />
        : location.pathname === "/secretary-appointment" ? <SecretaryAppointment />
        : location.pathname === "/secretary-activities-event" ? <SecretaryActivitiesEvent />
        : location.pathname === "/secretary-payment" ? <SecretaryPayment />
        : location.pathname === "/secretary-report" ? <SecretaryReport />
        : location.pathname === "/secretary-user-management" ? <SecretaryUserManagement />
        : location.pathname === "/secretary-baptism" ? <SecretaryBaptism />
        : location.pathname === "/secretary-marriage" ? <SecretaryMarriage />
        : location.pathname === "/secretary-funeral-mass" ? <SecretaryFuneralMass />
        : location.pathname === "/secretary-blessing" ? <SecretaryBlessing />
        : location.pathname === "/secretary-confirmation" ? <SecretaryConfirmation />
        : location.pathname === "/secretary-communion" ? <SecretaryCommunion />
        : location.pathname === "/secretary-baptism-view" ? <SecretaryBaptismView />
        : location.pathname === "/secretary-confirmation-view" ? <SecretaryConfirmationView />
        : location.pathname === "/secretary-marriage-view" ? <SecretaryMarriageView />
        : location.pathname === "/secretary-communion-view" ? <SecretaryCommunionView />
        : location.pathname === "/secretary-funeral-mass-view" ? <SecretaryFuneralMassView />
        : location.pathname === "/secretary-blessing-view" ? <SecretaryBlessingView />

        : location.pathname === "/client-dashboard" ? <ClientDashboard />
        : location.pathname === "/client-profile" ? <ClientProfile />
        : location.pathname === "/client-appointment" ? <ClientAppointment />
        : location.pathname === "/client-baptism" ? <ClientBaptism />
        : location.pathname === "/client-baptism-view" ? <ClientBaptismView />
        : location.pathname === "/client-marriage" ? <ClientMarriage />
        : location.pathname === "/client-marriage-view" ? <ClientMarriageView />
        : location.pathname === "/client-kumpil" ? <ClientKumpil />
        : location.pathname === "/client-kumpil-view" ? <ClientKumpilView />
        : location.pathname === "/client-communion" ? <ClientCommunion />
        : location.pathname === "/client-communion-view" ? <ClientCommunionView />
        : location.pathname === "/client-funeral-mass" ? <ClientFuneralMass />
        : location.pathname === "/client-funeral-mass-view" ? <ClientFuneralMassView />
        : location.pathname === "/client-blessing" ? <ClientBlessing />
        : location.pathname === "/client-blessing-view" ? <ClientBlessingView />
        : <HomePage />}
      </div>
      <div className="main-divider"></div>
    </div>
  );
};

// App Component - Route Definitions
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/parish-dashboard" element={<MainPage />} />
        <Route path="/parish-appointment" element={<MainPage />} />
        <Route path="/parish-activities-event" element={<MainPage />} />
        <Route path="/baptism-view" element={<MainPage />} />
        <Route path="/marriage-view" element={<MainPage />} />
        <Route path="/funeral-mass-view" element={<MainPage />} />
        <Route path="/confirmation-view" element={<MainPage />} />
        <Route path="/communion-view" element={<MainPage />} />
        <Route path="/blessing-view" element={<MainPage />} />

        <Route path="/community-dashboard" element={<MainPage />} />
        <Route path="/community-profile" element={<MainPage />} />
        <Route path="/community-activities-event" element={<MainPage />} />

        <Route path="/secretary-dashboard" element={<MainPage />} />
        <Route path="/secretary-schedule" element={<MainPage />} />
        <Route path="/secretary-appointment" element={<MainPage />} />
        <Route path="/secretary-activities-event" element={<MainPage />} />
        <Route path="/secretary-payment" element={<MainPage />} />
        <Route path="/secretary-report" element={<MainPage />} />
        <Route path="/secretary-user-management" element={<MainPage />} />
        <Route path="/secretary-baptism" element={<MainPage />} />
        <Route path="/secretary-marriage" element={<MainPage />} />
        <Route path="/secretary-funeral-mass" element={<MainPage />} />
        <Route path="/secretary-blessing" element={<MainPage />} />
        <Route path="/secretary-confirmation" element={<MainPage />} />
        <Route path="/secretary-communion" element={<MainPage />} />
        <Route path="/secretary-baptism-view" element={<MainPage />} />
        <Route path="/secretary-confirmation-view" element={<MainPage />} />
        <Route path="/secretary-marriage-view" element={<MainPage />} />
        <Route path="/secretary-communion-view" element={<MainPage />} />
        <Route path="/secretary-funeral-mass-view" element={<MainPage />} />
        <Route path="/secretary-blessing-view" element={<MainPage />} />

        <Route path="/client-dashboard" element={<MainPage />} />
        <Route path="/client-profile" element={<MainPage />} />        
        <Route path="/client-appointment" element={<MainPage />} />
        <Route path="/client-baptism" element={<MainPage />} />
        <Route path="/client-baptism-view" element={<MainPage />} />
        <Route path="/client-marriage" element={<MainPage />} />
        <Route path="/client-marriage-view" element={<MainPage />} />
        <Route path="/client-kumpil" element={<MainPage />} />
        <Route path="/client-kumpil-view" element={<MainPage />} />
        <Route path="/client-communion" element={<MainPage />} />
        <Route path="/client-communion-view" element={<MainPage />} />
        <Route path="/client-funeral-mass" element={<MainPage />} />
        <Route path="/client-funeral-mass-view" element={<MainPage />} />
        <Route path="/client-blessing" element={<MainPage />} />
        <Route path="/client-blessing-view" element={<MainPage />} />
      </Routes>
    </Router>
  );
};

export default App;