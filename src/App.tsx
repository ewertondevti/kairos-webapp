import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { ManagementRoutesEnums, RoutesEnums } from "./enums/routesEnums";
import { Gallery } from "./pages/Gallery";
import { Home } from "./pages/Home";
import Management from "./pages/Management";
import { AlbumsTab } from "./pages/Management/tabs/AlbumsTab";
import { AlbumDetails } from "./pages/Management/tabs/AlbumsTab/AlbumDetails";
import { EventsTab } from "./pages/Management/tabs/EventsTab";
import { PresentationTab } from "./pages/Management/tabs/PresentationTab";
import { MembershipForm } from "./pages/MembershipForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RoutesEnums.Home} element={<AppLayout />}>
          <Route index element={<Home />} />

          <Route path={RoutesEnums.Gallery} element={<Gallery />} />
          <Route
            path={RoutesEnums.MembershipForm}
            element={<MembershipForm />}
          />

          <Route path={RoutesEnums.Management} element={<Management />}>
            <Route
              index
              element={<Navigate to={ManagementRoutesEnums.Albums} />}
            />

            <Route path={ManagementRoutesEnums.Albums} element={<AlbumsTab />}>
              <Route path=":id" element={<AlbumDetails />} />
            </Route>

            <Route
              path={ManagementRoutesEnums.Presentation}
              element={<PresentationTab />}
            />

            <Route
              path={ManagementRoutesEnums.Events}
              element={<EventsTab />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={RoutesEnums.Home} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
