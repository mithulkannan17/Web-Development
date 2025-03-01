import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../header/PageHeader";
import axios from 'axios';

function FlightEdit() {
    const [flight, setFlight] = useState({ id: '', number: '', model: '', type: '' });
    const params = useParams();
    const navigate = useNavigate();

    const txtBoxOnChange = event => {
        const updatableFlight = { ...flight };
        updatableFlight[event.target.id] = event.target.value;
        setFlight(updatableFlight);
    };

    useEffect(() => {
        const readById = async () => {
            const baseUrl = "http://localhost:8080";
            try {
                const response = await axios.get(`${baseUrl}/flights/${params.id}`);
                const queriedFlight = response.data;
                setFlight(queriedFlight);
            } catch (error) {
                alert('Server Error');
            }
        };

        readById();
    }, [params.id]);

    const updateFlight = async () => {
        const baseUrl = "http://localhost:8080";
        try {
            const response = await axios.put(`${baseUrl}/flights/${params.id}`, { ...flight });
            const updatedFlight = response.data.flight;
            setFlight(updatedFlight);
            alert(response.data.message);
            navigate('/flights/list');
        } catch (error) {
            alert('Server Error');
        }
    };

    return (
        <>
            <PageHeader />

            <h3><a href="/flights/list" className="btn btn-light">Go Back</a>Edit Flight</h3>
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
                <button className="btn btn-warning" style={{ marginRight: '10px' }}
                    onClick={updateFlight}>Update Flight</button>

                <button className="btn btn-secondary" onClick={() => navigate('/flights/list')}>Cancel</button>

            </div>
        </>
    );
}

export default FlightEdit;
