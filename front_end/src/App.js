import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Footer from "./components/Footer";



function App() {
  return (
    <div className="font-bold">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
        </Routes>
        <Footer/>
    </div>
  );
}

export default App;