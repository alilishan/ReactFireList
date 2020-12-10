import React from 'react';


// Context Object
export default React.createContext({
    isLoggingIn: false,
    isLoggingOut: false,
    isVerifying: false,
    loginError: false,
    logoutError: false,
    isAuthenticated: false,
	user: {},
	login: (email, password) => {
		console.log('From Context', email, password, this)
	},
    signout: () => { console.log('Not here') },
	updateUser: () => {}
});