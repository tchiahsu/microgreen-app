import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BackgroundGradientAnimation } from './components/ui/background-gradient-animation'
import './App.css'

import Product from "./pages/Product";

function App() {

  return (
    <BackgroundGradientAnimation>
      <BrowserRouter>
        {/* Application Pages */}
        <Routes>
          <Route path="/" element={<Product />} />
        </Routes>
      </BrowserRouter>
    </BackgroundGradientAnimation>
  )
}

export default App
