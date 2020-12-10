import React, { Component } from 'react';

import AuthContext from '../context/AuthContext';
import { FirebaseDB } from '../firebase';
import Lists from './Lists';
import Shared from './Shared';


class Home extends Component {
	static contextType = AuthContext;
	

	constructor(props) {
		super(props);

		this.fdbListRef = null;
	
		this.state = {
			isLoading: true,
			userList: {}
		}
	}

	
	componentDidMount() {
		this.getUsers();
	}

	componentWillUnmount(){
		// Detach Firebase Listners
		if(this.fdbListRef !== null) this.fdbListRef.off();
	}

	getUsers(){

		this.fdbListRef = FirebaseDB
			.ref('/users/');

		this.fdbListRef.on("value", (snapshot) => {

				this.setState({ 
					isLoading: false,
					userList: snapshot.val() === null ? {} : snapshot.val()
				});
			
			}, (errorObject) => {
				console.log("The read failed: " + errorObject.code);
			});
	}

	
	render() {
		const { isLoading } = this.state;

		if(isLoading){
			return (
				<div className="container">
					<div className="text-center">
						Loading Home ...
					</div>
				</div>
			)
		}

		return (
			<div className="pb-5">
				<Lists uid={ this.context.user.uid } userList={ this.state.userList } />
				<Shared uid={ this.context.user.uid } userList={ this.state.userList } />
			</div>
    	);
  	}
}


export default Home;