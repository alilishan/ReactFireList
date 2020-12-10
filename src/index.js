import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import AuthState from './context/Auth';
import App from './App';

ReactDOM.render(
	<AuthState>
		<App />
	</AuthState>, document.getElementById('root'));
