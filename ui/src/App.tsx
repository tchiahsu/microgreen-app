import { BrowserRouter } from 'react-router-dom'
import { BackgroundGradientAnimation } from './components/ui/background-gradient-animation'
import './App.css'

function App() {

  return (
    <BackgroundGradientAnimation>
      <BrowserRouter>
        {/* Application Pages */}
      </BrowserRouter>
    </BackgroundGradientAnimation>
  )
}

export default App
