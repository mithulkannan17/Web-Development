import { useState } from "react";
import PageHeader from "../header/PageHeader";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function FlightCreate() {
    const [flight, setFlight] = useState({ id: '', number: '', model: '', type: '' });
    const navigate = useNavigate();
    const txtBoxOnChange = event => {
        const updatableFlight = { ...flight };
        updatableFlight[event.target.id] = event.target.value; //updatableFlight['type'] = event.target.value;
        setFlight(updatableFlight);
    };
    const createFlight = async () => {
        const baseUrl = "http://localhost:8080";
        try {
            const response = await axios.post(`${baseUrl}/flights`, { ...flight });
            const createdFlight = response.data.flight;
            setFlight(createdFlight);
            alert(response.data.message);
            navigate('/flights/list');
        } catch (error) {
            alert('Server Error');
        }
    };

    return (
        <>
            <PageHeader />
            <h3><a href="/flights/list" className="btn btn-light">Go Back</a><h1 className="text-center"><em> Add Flights </em></h1></h3>

            <div className="container">
                <div className="form-group mb-3">
                    <label htmlFor="number" className="form-label">Flight Number:</label>
                    <input type="text" className="form-control" id="number"
                        placeholder="please enter flight number"
                        value={flight.number}
                        onChange={txtBoxOnChange} />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="model" className="form-label">Flight Model:</label>
                    <input type="text" className="form-control" id="model"
                        placeholder="please enter flight model"
                        value={flight.model}
                        onChange={txtBoxOnChange} />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="type" className="form-label">Flight Type (Commercial/ Cargo/ Private):</label>
                    <input type="text" className="form-control" id="type"
                        placeholder="please enter flight type"
                        value={flight.type}
                        onChange={txtBoxOnChange} />
                </div>
                <button className="btn btn-primary" style={{ marginRight: '10px' }}
                    onClick={createFlight}>Add Flight</button>
                <button className="btn btn-secondary" onClick={() => navigate('/flights/list')}>Cancel</button>
            </div>
        </>
    );
}

export default FlightCreate;
