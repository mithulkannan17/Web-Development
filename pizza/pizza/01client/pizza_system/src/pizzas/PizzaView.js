import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../header/PageHeader";
import axios from 'axios'

function PizzaView() {
    const [pizza, setPizza] = useState({ id: '', number: '', model: '', type: '' });
    const params = useParams();
    const readById = async () => {
        const baseUrl = "http://localhost:8080"
        try {
            const response = await axios.get(`${baseUrl}/pizzas/${params.id}`)
            const queriedPizza = response.data;
            setPizza(queriedPizza);
        } catch (error) {
            alert('Server Error');
        }
    };
    useEffect(() => {
        readById();
    }, []);
    return (
        <>
            <PageHeader />

            <h3><a href="/pizzas/list" className="btn btn-light">Go Back</a>View Pizza</h3>
            <div className="container">
                <div className="form-group mb-3">
                    <label htmlFor="number" className="form-label">Pizza Number:</label>
                    <div className="form-control" id="number">{pizza.number}</div>
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="model" className="form-label">Pizza Model:</label>
                    <div className="form-control" id="model">{pizza.model}</div>
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="type" className="form-label">Pizza Type (Margherita/ Pepperoni/ Veggie):</label>
                    <div className="form-control" id="type">{pizza.type}</div>
                </div>
            </div>
        </>
    );
}

export default PizzaView;
