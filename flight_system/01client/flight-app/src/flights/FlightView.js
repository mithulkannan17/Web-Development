import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../header/PageHeader";
import axios from 'axios';

function FlightView() {
    const [flight, setFlight] = useState({ id: '', number: '', model: '', type: '' });
    const params = useParams();

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

    return (
        <>
            <PageHeader />
            <div className="view-page-container"> {/* Apply the CSS class */}
                <div className="container">
                    <h3><a href="/flights/list" className="btn btn-light">Go Back</a><h1 className="text-center"><em> View Flights </em></h1></h3>
                    <div className="form-group mb-3">
                        <label htmlFor="number" className="form-label">Flight Number:</label>
                        <div className="form-control" id="number">{flight.number}</div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="model" className="form-label">Flight Model:</label>
                        <div className="form-control" id="model">{flight.model}</div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="type" className="form-label">Flight Type (Commercial/ Cargo/ Private):</label>
                        <div className="form-control" id="type">{flight.type}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default FlightView;
