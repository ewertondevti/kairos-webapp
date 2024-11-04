import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { RoutesEnums } from "./enums/routesEnums";
import Gallery from "./pages/Gallery";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RoutesEnums.Home} element={<AppLayout />}>
          <Route path={RoutesEnums.Gallery} element={<Gallery />} />
        </Route>

        <Route path="*" element={<Navigate to={RoutesEnums.Home} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
