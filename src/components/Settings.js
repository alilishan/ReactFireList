import React, { Component } from 'react';

import AuthContext from '../context/AuthContext';
import { SwalToast } from './Helpers';

class Settings extends Component {
	static contextType = AuthContext;

	constructor(props) {
		super(props);

		this.state = {
			displayName: "Jane Q. User",
			photoURL: "https://example.com/jane-q-user/profile.jpg"
		}

		this.updateUser = this.updateUser.bind(this);
	}

	componentDidMount(){
		this.setState({ displayName: this.context.user.displayName });
	}
	

	updateUser(){
		this.context.updateUser(this.state, () => {
			SwalToast('User Updated', 'success');
		})
	}

	
	render() {
		const { user } = this.context;


		return (
			<div className="container">
				<div className="card border-0 shadow">
					<div className="card-body">
						
						<div className="form-group">
							<label>UID</label>
							<input type="text" className="form-control" value={ user.uid } readOnly />
						</div>

						<div className="form-group">
							<label>Name</label>
							<input type="text" className="form-control" value={ this.state.displayName } onChange={ (e) => this.setState({ displayName: e.target.value }) } />
						</div>

						<pre>Photo { user.photoURL }</pre>
						
						<button className="btn btn-primary btn-block" onClick={ this.updateUser }>Update User</button>
					</div>
				</div>
			</div>
    	);
  	}
}


export default Settings;