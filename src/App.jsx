import './App.css'
import { useState } from 'react'
import './navbar.css'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import Upload from './components/Upload'
import Demo from './components/Demo';
import Guide from './components/Guide';

function App() {
  return (
    <>
    <Router>
      <Switch>
        <Route path='/' exact children={<Upload />} />
        <Route path='/demo' exact children={<Demo />} />
        <Route path='/guide' exact children={<Guide />} />
      </Switch>
    </Router>
    </>
  )
}

export default App
