import { useState } from "react";
import PageHeader from "../header/PageHeader";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function PizzaCreate() {
    const [pizza, setPizza] = useState({ id: '', number: '', model: '', type: '' });
    const navigate = useNavigate();
    const txtBoxOnChange = event => {
        const updatablePizza = { ...pizza };
        updatablePizza[event.target.id] = event.target.value; //updatablePizza['type'] = event.target.value;
        setPizza(updatablePizza);
    };
    const createPizza = async () => {
        const baseUrl = "http://localhost:8080";
        try {
            const response = await axios.post(`${baseUrl}/pizzas`, { ...pizza });
            const createdPizza = response.data.pizza;
            setPizza(createdPizza);
            alert(response.data.message);
            navigate('/pizzas/list');
        } catch (error) {
            alert('Server Error');
        }
    };

    return (
        <>
            <PageHeader />
            <h3><a href="/pizzas/list" className="btn btn-light">Go Back</a><h1 className="text-center"><em> Add Pizzas </em></h1></h3>

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
                <button className="btn btn-primary" style={{ marginRight: '10px' }}
                    onClick={createPizza}>Create Pizza</button>
                <button className="btn btn-secondary" onClick={() => navigate('/pizzas/list')}>Cancel</button>
            </div>
        </>
    );
}

export default PizzaCreate;
