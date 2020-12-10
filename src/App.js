import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import AuthContext from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Items from './components/Items';
import Settings from './components/Settings';


class App extends Component {
    static contextType = AuthContext;

    // constructor(props) {
    //     super(props);
    // }

    render() {
        // console.log(this.context)
        const { isAuthenticated, isVerifying, isLoggingIn, isLoggingOut } = this.context;

        if(isVerifying){
            return (
                <div className="container">
                    <div className="px-5 text-center">Loading App ...</div>
                </div>
            )
        }

        if(isLoggingIn){
            return (
                <div className="container">
                    <div className="px-5 text-center">Logging In ...</div>
                </div>
            )
        }

        if(isLoggingOut){
            return (
                <div className="container">
                    <div className="px-5 text-center">Logging Out ...</div>
                </div>
            )
        }

        return (

            <Router>
                {isAuthenticated && <Navbar onSignOut= { this.context.signout } />}
                
                <Switch>

                    <ProtectedRoute
                        exact
                        path="/"
                        component={Home}
                        isAuthenticated={isAuthenticated}
                        isVerifying={isVerifying}
                    />

                    <ProtectedRoute
                        path="/settings"
                        component={Settings}
                        isAuthenticated={isAuthenticated}
                        isVerifying={isVerifying}
                    />

                    <ProtectedRoute
                        path="/items/:listType/:listId"
                        component={Items}
                        isAuthenticated={isAuthenticated}
                        isVerifying={isVerifying}
                    />
                    
                    <Route path="/login" component={Login} />

                </Switch>
            </Router>
        );
    }

}


export default App;