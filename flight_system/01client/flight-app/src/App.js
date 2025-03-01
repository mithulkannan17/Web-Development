import FlightList from './flights/FlightList'
import FlightCreate from './flights/FlightCreate'
import FlightView from './flights/FlightView'
//import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import FlightEdit from './flights/FlightEdit';

function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="" element={<FlightList />} />
            <Route path="/flights/list" element={<FlightList />} />
            <Route path="/flights/create" element={<FlightCreate />} />
            <Route path="/flights/view/:id" element={<FlightView />} />
            <Route path="/flights/edit/:id" element={<FlightEdit />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
