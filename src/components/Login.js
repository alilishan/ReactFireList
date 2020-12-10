import React, { Component } from 'react';
import { Redirect } from "react-router-dom";

import AuthContext from '../context/AuthContext';

class Login extends Component {
	static contextType = AuthContext;

	constructor(props) {
		super(props);

		this.state = {
			email: '', //'alilishan@gmail.com',
			password: '' //'aL751933'
		}

		this.login = this.login.bind(this);
	}

	
	login() {
		this.context.login(this.state.email, this.state.password)
	}

	
	render() {

	    const { isAuthenticated, loginError } = this.context;
	    
	    if (isAuthenticated) {
			return <Redirect to="/" />;
	    }
		
		return (
			<div className="container">
				<div className="row">
					<div className="col-sm-10 col-md-8 col-lg-6 offset-sm-1 offset-md-2 offset-lg-3 	">
						<div className="card border-0 shadow-sm mt-4 mb-3">
							<div className="card-body">

								<small className="text-muted d-block py-4 ftw-600 ls-8 text-uppercase text-center">Sign In</small>

								<small className="text-muted d-block ftw-600 ls-8">Username</small>
								<input type="text" name="email" className="form-control mb-3" placeholder="Email" value={ this.state.email } onChange={ (e) => { this.setState({ email: e.target.value }) } }/>
								
								<small className="text-muted d-block ftw-600 ls-8 mt-2">Password</small>
								<input type="password" name="password" className="form-control mb-4" placeholder="Password" value={ this.state.password } onChange={ (e) => { this.setState({ password: e.target.value }) } }/>
								
								{ loginError && (
									<div className="text-danger d-block ftw-600 text-center pb-3">Login Error</div>
								)}

								<button className="btn btn-primary py-2 mt-2 text-uppercase ftw-600 ls-8 btn-block" onClick={ this.login } >Login</button>

							</div>
						</div>
					</div>
				</div>
			</div>
    	);
  	}
}


export default Login;