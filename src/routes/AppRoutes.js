import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Login from '../components/Login/Login';
import Navbar from '../components/Navbar/Navbar';
import Register from '../components/Register/Register';

function AppRoutes() {
    return (
        <Switch>
            <Route path="/" exact>
                <Navbar />
            </Route>
            <Route path="/login">
                <Login />
            </Route>
            <Route path="/register">
                <Register />
            </Route>
            <Route path="*">
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you are looking for does not exist.</p>
                </div>
            </Route>
        </Switch>
    );
}

export default AppRoutes;
