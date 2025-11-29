import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { BackgroundGradientAnimation } from './components/ui/background-gradient-animation'
import { Toaster } from 'sonner'

import Layout from "./pages/Layout";
import Home from "./pages/pages/Home";
import Crop from "./pages/pages/Crop";
import Harvest from "./pages/pages/Harvest";
import Order from "./pages/pages/Order";
import Product from "./pages/pages/Product";
import Client from "./pages/pages/Client";
import Employee from "./pages/pages/Employee";
import Login from "./pages/pages/Login";
import RequireAuth from "./components/requireAuth";


function App() {

  return (
    <>
      <Toaster position="top-right"/>
      <BackgroundGradientAnimation>
        <BrowserRouter>
          {/* Application Pages */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/app" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/app/crop" element={<Crop />} />
                <Route path="/app/harvest" element={<Harvest />} />
                <Route path="/app/order" element={<Order />} />
                <Route path="/app/product" element={<Product />} />
                <Route path="/app/client" element={<Client />} />
                <Route path="/app/employee" element={<Employee />} />
                <Route path="/app/landing" element={<Login />} />
              </Route>
            </Route>
            <Route path="*" element={<Login />}/>
          </Routes>
        </BrowserRouter>
      </BackgroundGradientAnimation>
    </>
  )
}

export default App
