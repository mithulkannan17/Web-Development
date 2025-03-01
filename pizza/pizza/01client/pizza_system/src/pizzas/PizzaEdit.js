import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../header/PageHeader";
import axios from 'axios'

function PizzaEdit() {
    const [pizza, setPizza] = useState({ id: '', number: '', model: '', type: '' });
    const params = useParams();
    const navigate = useNavigate();
    const txtBoxOnChange = event => {
        const updatablePizza = { ...pizza };
        updatablePizza[event.target.id] = event.target.value;
        setPizza(updatablePizza);
    };
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
    const updatePizza = async () => {
        const baseUrl = "http://localhost:8080"
        try {
            const response = await axios.put(`${baseUrl}/pizzas/${params.id}`, { ...pizza })
            const updatedPizza = response.data.pizza;
            setPizza(updatedPizza);
            alert(response.data.message)
            navigate('/pizzas/list')
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

            <h3><a href="/pizzas/list" className="btn btn-light">Go Back</a>Edit Pizza</h3>
            <div className="container">
                <div className="form-group mb-3">
                    <label htmlFor="number" className="form-label">Pizza Number:</label>
                    <input type="text" className="form-control" id="number"
                        placeholder="please enter pizza number"
                        value={pizza.number}
                        onChange={txtBoxOnChange} />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="model" className="form-label">Pizza Model:</label>
                    <input type="text" className="form-control" id="model"
                        placeholder="please enter pizza model"
                        value={pizza.model}
                        onChange={txtBoxOnChange} />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="type" className="form-label">Pizza Type (Margherita/ Pepperoni/ Veggie):</label>
                    <input type="text" className="form-control" id="type"
                        placeholder="please enter pizza type"
                        value={pizza.type}
                        onChange={txtBoxOnChange} />
                </div>
                <button className="btn btn-warning"
                    onClick={updatePizza}>Update Pizza</button>

                <button className="btn btn-secondary" onClick={() => navigate('/pizzas/list')}>Cancel</button>

            </div>
        </>
    );
}

export default PizzaEdit;
