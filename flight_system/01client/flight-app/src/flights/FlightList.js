import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../header/PageHeader';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

function FlightList() {
    const [flights, setFlights] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFlights, setFilteredFlights] = useState([]);

    const readAllFlights = async () => {
        try {
            const response = await axios.get('http://localhost:8080/flights');
            setFlights(response.data);
        } catch (error) {
            alert('Server Error');
        }
    };

    useEffect(() => {
        readAllFlights();
    }, []);

    useEffect(() => {
        setFilteredFlights(
            flights.filter(flight =>
                flight.number.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, flights]);

    const deleteFlight = async (id) => {
        if (!window.confirm('Are you sure to delete?')) {
            return;
        }
        try {
            await axios.delete(`http://localhost:8080/flights/${id}`);
            readAllFlights();
        } catch (error) {
            alert('Server Error');
        }
    };

    return (
        <>
            <PageHeader />
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="text-center w-100"><em>List of Flights</em></h1>
                    <input
                        type="text"
                        className="form-control w-25"
                        placeholder="Search by flight number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="card">
                    <DataTable value={filteredFlights} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
                        <Column field="id" header="ID" style={{ width: '20%' }}></Column>
                        <Column field="number" header="Flight Number" style={{ width: '20%' }}></Column>
                        <Column field="model" header="Model" style={{ width: '20%' }}></Column>
                        <Column field="type" header="Type" style={{ width: '20%' }}></Column>
                        <Column header="Actions" body={(rowData) => (
                            <>
                                <a href={`/flights/view/${rowData.id}`} className="btn btn-success" style={{ marginRight: '5px' }}>View</a>
                                <a href={`/flights/edit/${rowData.id}`} className="btn btn-warning" style={{ marginRight: '5px' }}>Edit</a>
                                <button className="btn btn-danger" onClick={() => deleteFlight(rowData.id)}>Delete</button>
                            </>
                        )} style={{ width: '20%' }}></Column>
                    </DataTable>
                </div>
            </div>
        </>
    );
}

export default FlightList;
