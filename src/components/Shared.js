import React, { Component, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { FirebaseDB } from '../firebase';
import { moItem, moContainer } from '../animations/framermotion';
import Avatar from './Avatar';

class Shared extends Component {
	
	constructor(props) {
		super(props);


		this.fdbListRef = null;
		this.uid = this.props.uid;

		this.state = {
			isLoading: true,
			lists: {}
		}

	}


	componentDidMount(){
		this.getLists();
	}


	componentWillUnmount(){
		// Detach Firebase Listners
		if(this.fdbListRef !== null) this.fdbListRef.off();
	}


	getLists(){

		this.fdbListRef = FirebaseDB
			.ref('shared')
			.orderByChild('userId')
			.equalTo(this.uid);


		this.fdbListRef.on("value", (snapshot) => {
				let _lists = [];

				if(snapshot.val() !== null){
					const _snap = snapshot.val();
					const _keys = Object.keys(_snap)
					
					_lists = _keys.map((key) => {
						return { id: key, ..._snap[key] };
					});
					
					// Quick Sort because firebase sort not working
					_lists.sort((a, b) => (a.order > b.order) ? 1 : -1)
				}
				
				// console.log(_lists);

				this.setState({ 
					isLoading: false,
					lists: _lists 
				});
			
			}, (errorObject) => {
				console.log("The read failed: " + errorObject.code);
			});
	}


	render() {

		const { isLoading, lists } = this.state;
		const styles = {
			position: 'absolute',
			top: '6px',
			left: '50%',
			marginLeft: '-48px',
			background: '#f5f7f9',
			fontSize: '12px'
		}

		if(isLoading){
			return (
				<div className="container">
					<div className="text-center">
						Loading Shared Lists ...
					</div>
				</div>
			)
		}


		if(lists){

			return (
				<div className="container mt-3">
					<div className="py-3" style={{position:'relative'}}>
						<hr/>
						<span className="d-block p-3 text-uppercase ftw-600 ls-8" style={ styles }>Shared</span>
					</div>
					<motion.ul 
						className="p-0 m-0 list-unstyled" 
						variants={moContainer}
				    	initial="hidden"
				    	animate="visible"
				    >

						{lists.map((item, index) => (
							<SharedItem 
								key={`item-${item.id}`} 
								index={index} 
								item={item} 
								userList={ this.props.userList }
							/>
						))}


					</motion.ul>
				</div>
			);

		}

	}
}

export default Shared;



const SharedItem = ({ item, userList }) =>{
	
	const [isLoading, setLoading] = useState(true);
	const [name, setName] = useState('');
	const [type, setType] = useState('');

	useEffect(() => {
		let fdbListRef = FirebaseDB
				.ref('/lists/' + item.userOwner + '/' + item.listId);

			fdbListRef.on("value", (snapshot) => {
					if(snapshot.val() !== null){
						const _snapValue = snapshot.val();

						setName(_snapValue.name);
						setType(_snapValue.type);
					}
					
					setLoading(false);
				
				}, (errorObject) => {
					console.log("The read failed: " + errorObject.code);
				});

		return () => {
			if(fdbListRef !== null) fdbListRef.off();
		};
	}, [item])


	if(isLoading){
		return (
			<motion.li variants={moItem} className="list-unstyled">
				<div className="card border-0 shadow-sm mb-2" >
					<div className="card-body">
						Loading ..
					</div>
				</div>
			</motion.li>
		)
	}


	return (
		<motion.li variants={moItem} className="list-unstyled">
			<div className="card border-0 shadow-sm mb-2" >
				<div className="row no-gutters">
					<div className="col-2 text-center p-2 d-flex align-items-center justify-content-center">
						<Avatar chars={ userList[item.userOwner].displayName.charAt(0) } color={ '#ccc'  } />	
					</div>
					<div className="col-10 p-2">
						<Link className="text-reset py-2 d-block" to={ `/items/${type}/${item.listId}` }>{ name }</Link>
					</div>
				</div>
			</div>
		</motion.li>

	)
};