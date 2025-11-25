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


function App() {

  return (
    <>
      <Toaster position="top-right"/>
      <BackgroundGradientAnimation>
        <BrowserRouter>
          {/* Application Pages */}
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/crop" element={<Crop />} />
              <Route path="/harvest" element={<Harvest />} />
              <Route path="/order" element={<Order />} />
              <Route path="/product" element={<Product />} />
              <Route path="/client" element={<Client />} />
              <Route path="/employee" element={<Employee />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BackgroundGradientAnimation>
    </>
  )
}

export default App
