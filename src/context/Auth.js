import React, { Component } from 'react';

import AuthContext from './AuthContext';
import { FirebaseApp, FirebaseDB } from '../firebase';

// Wrapper Class
class Auth extends Component {

	state = {
        isLoggingIn: false,
        isLoggingOut: false,
        isVerifying: true,
        loginError: false,
        logoutError: false,
        isAuthenticated: false,
        user: {}
	}
	
	componentDidMount(){

		/*setTimeout(() => {
			this.setState({ isAuthenticated: true });
		}, 5000);	*/	

		FirebaseApp
			.auth()
			.onAuthStateChanged((user) => {
				if (user) {
					this.setState({
						user,
						isVerifying: false,
						isAuthenticated: true,
						isLoggingIn: false,
						isLoggingOut: false,
						loginError: false
					});
				} else {
					this.setState({
						user: {},
						isVerifying: false,
						isAuthenticated: false,
						isLoggingIn: false,
						isLoggingOut: false,
						loginError: false
					});
				}
			});
	}

	login = (email, password) => {
		this.setState({isLoggingIn: true});

		FirebaseApp
			.auth()
			.signInWithEmailAndPassword(email, password)
			.catch((error) => {
				console.log(error)
				this.setState({ loginError: true });
			});
	}

	signout = () => {
		console.log('Logout here');
		this.setState({isLoggingOut: true});
		
		FirebaseApp
			.auth()
			.signOut()
			.then(function() {
				// Sign-out successful.
			}).catch(function(error) {
				// An error happened.
			});
	}

	
	updateUser = (data, cb) => {
		FirebaseApp
			.auth()
			.currentUser
			.updateProfile(data)
			.then(function() {
				if(typeof cb === 'function') cb();
			}).catch(function(error) {
		  		// An error happened.
			});

		FirebaseDB
			.ref('/users/' + this.state.user.uid)
			.update({
				...data,
				updated: new Date().getTime()
			});
	}


	render() {
		return (
			<AuthContext.Provider 
				value = {{
					...this.state,
					login: this.login,
					signout: this.signout,
					updateUser: this.updateUser
				}}
			>
				{ this.props.children }
			</AuthContext.Provider>
		) 
	}

}

export default Auth;