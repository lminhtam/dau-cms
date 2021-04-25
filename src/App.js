import Home from 'pages/Home/home.page'
import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <Route exact path="/" component={Home} />
    </Router>
  )
}

export default App
