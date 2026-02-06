import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Menu from './componets/menu/menu'
import Cronometro from './componets/cronometro/cronometro'

import Home from './pages/home/home'
import EditalPage from './pages/editalPage/editalPage'
import HistoricoPage from './pages/historicoPage/historicoPage'
import Disciplina from './componets/edital/disciplina'


function App() {

  return (
    <div className='container-mainApp'>
      <Router>
        <Menu />
        <Routes>
          <Route path='/' element={<Navigate to="/home" replace />}></Route>

          <Route path='/home' element={<Home />}></Route>
          <Route path='/edital' element={<EditalPage />}></Route>
          <Route path='/historico' element={<HistoricoPage />}></Route>
          <Route path='/home' element={<Home />}></Route>
        </Routes>
        <Cronometro />
      </Router>
    </div >
  )
}

export default App
