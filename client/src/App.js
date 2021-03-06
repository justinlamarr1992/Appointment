// import those pages in App.js
// then based on the path show each components using react-router components
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopNav from "./components/TopNav";
import PrivateRoute from "./components/PrivateRoute";
// components
import Home from "./booking/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./user/Dashboard";
import DashboardSeller from "./user/DashboardSeller";
import NewHotel from "./hotels/NewHotel";
import StripeCallback from "./stripe/StripeCallback";
import EditHotel from "./hotels/EditHotel";
import ViewHotel from "./hotels/ViewHotel";
import StripeSuccess from "./stripe/StripeSuccess";
import StripeCancel from "./stripe/StripeCancel";
import SearchResult from "./hotels/SearchResult";

/**
 * Lets create TopNavigation/menu bar so that we can easily TopNavigate between pages
 * lets write it in App.js before we move it to its own component
 */

function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <ToastContainer position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/seller"
          element={
            <PrivateRoute>
              <DashboardSeller />
            </PrivateRoute>
          }
        />
        <Route
          path="/hotels/new"
          element={
            <PrivateRoute>
              <NewHotel />
            </PrivateRoute>
          }
        />
        <Route
          path="/stripe/callback"
          element={
            <PrivateRoute>
              <StripeCallback />
            </PrivateRoute>
          }
        />
        <Route
          path="/hotel/edit/:hotelId"
          element={
            <PrivateRoute>
              <EditHotel />
            </PrivateRoute>
          }
        />
        <Route path="/hotel/:hotelId" element={<ViewHotel />} />
        <Route
          path="/stripe/success/:hotelId"
          element={
            <PrivateRoute>
              <StripeSuccess />
            </PrivateRoute>
          }
        />
        <Route
          path="/stripe/cancel"
          element={
            <PrivateRoute>
              <StripeCancel />
            </PrivateRoute>
          }
        />
        <Route path="/search-result" element={<SearchResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
