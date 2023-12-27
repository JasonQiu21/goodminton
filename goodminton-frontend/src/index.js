import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from './pages/Layout.js'
import Home from './pages/Home.js'
import Events from './pages/Events.js'

import "./style.css"


export default function App() {
  const [auth, setAuth] = useState(null);

  React.useEffect(() => {
    if (window.sessionStorage.getItem("auth")) setAuth(window.sessionStorage.getItem("auth"))
  }, null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout auth={auth} />} >
          <Route index element={<Home />} />
          <Route path="/events" element={<Events auth={auth} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
