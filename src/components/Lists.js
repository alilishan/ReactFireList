import React from 'react';
import { Link } from "react-router-dom";
import Octicon, {iconsByName} from '@primer/octicons-react'
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import { motion } from "framer-motion";
import arrayMove from 'array-move';

import { FirebaseDB } from '../firebase';
import { SwalToast, SwalConfirm, SwalInput, SwalChoose } from './Helpers';
import { moItem, moContainer } from '../animations/framermotion';
import Dropdown from './Bootstrap/Dropdown';
import Avatar from './Avatar';

class Lists extends React.Component {

	constructor(props) {
		super(props);
		
		this.fdbListRef = null;
		this.uid = this.props.uid;

		this.state = {
			isLoading: true,
			listName: '',
			listType: 'expense',
			lists: {},
			items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6']
		}

		this.createList = this.createList.bind(this);
		this.removeList = this.removeList.bind(this);
		this.editList = this.editList.bind(this);
		this.onSortEnd = this.onSortEnd.bind(this);
		this.shareList = this.shareList.bind(this);
	}


	componentDidMount(){
		this.getLists();
		// this.getSharedLists();
	}

	componentWillUnmount(){

		// Detach Firebase Listners
		if(this.fdbListRef !== null) this.fdbListRef.off();
	}


	createList(){

		if(this.state.listName === ''){
			SwalToast('Please Provide a List Name', 'error');	
			return false;
		} 

		FirebaseDB
			.ref('/lists/' + this.uid)
			.push({
				name: this.state.listName,
				type: this.state.listType,
				order: 0,
				starred: false,
				created: new Date().getTime()
			});

		this.setState({
			listName: '',
		})		

		// FirebaseDB - Set only Sets, Push creates new record
		// 	.ref('/lists/' + uid)
		// 	.set({
		// 		name: 'New List',
		// 		type: 'expense',
		// 		created: new Date().getTime()
		// 	});
	}


	removeList(item, value){
		SwalConfirm()
			.then(() => {
				// You can also delete by specifying null as the value for another write operation such as set()
				FirebaseDB
					.ref('/lists/' + this.uid + '/' + item.id)
					.set(null);	

				// Remove Items also
				FirebaseDB
					.ref('/items/' + item.id)
					.set(null);

				this.removeShared(item.id);		
					
			}, () => { });
	}


	
	removeShared(listId){
		FirebaseDB
			.ref('shared')
			.orderByChild('listId')
			.equalTo(listId)
			.once('value')
			.then( snapshot => {
				const snapVal = snapshot.val();

				if(snapVal !== null){
					let obj = { ...snapVal }

					for (var key in obj) {
						obj[key] = null;
					}

					FirebaseDB
						.ref('shared')
						.update(obj);
					
				}
			});

	}



	editList(item){
		SwalInput(item.name)
			.then((result) => {
				FirebaseDB
					.ref('/lists/' + this.uid + '/' + item.id)
					.update({
						name: result.value
					});	
			}, () => {})
	}


	shareList(item){
		var users = { ...this.props.userList };

		for (const key in users) {
			users[key] = users[key].displayName;
		}

		delete users[this.uid];
		
		SwalChoose(users, 'Select User', `Share ${item.name}`)
			.then((selectedUID) => {

				this.checkShare(selectedUID, item.id)
					.then(() => {

						FirebaseDB
							.ref('/shared/')
							.push({
								listId: item.id,
								listName: item.name,
								userId: selectedUID,
								userOwner: this.uid,
								order: 0,
								created: new Date().getTime()
							});

					}, () => {
						SwalToast('Shared Already', 'info')
					});

			})
	}

	
	checkShare(userId, listId){
		return new Promise((resolve, reject) => {

			FirebaseDB
				.ref('shared')
				.orderByChild('userId')
				.equalTo(userId)
				.once('value')
				.then( snapshot => {
					const _snapVal = snapshot.val();
					let found = false;

					if(_snapVal === null) resolve();
					
					for (var key in _snapVal) {
						found = _snapVal[key].listId === listId? true : found;
					}

					if(found) {
						reject();
					} else {
						resolve();
					} 

				});

		});
	}



	getSharedLists(){
		const listID = '-Lz-zVarEmoCsNzey6uC';

		FirebaseDB
			.ref('/shared')
			.orderByChild('key')
			.equalTo(listID)
			.once('value')
			.then((snapshot) => {
				console.log(snapshot.val());
			})
	}


	
	getLists(){

		this.fdbListRef = FirebaseDB
			.ref('/lists/' + this.uid);
			// .orderByChild('order');


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

				this.setState({ 
					isLoading: false,
					lists: _lists 
				});
			
			}, (errorObject) => {
				console.log("The read failed: " + errorObject.code);
			});
	}

	onSortEnd = ({oldIndex, newIndex}) => {
	  //   this.setState(({lists}) => ({
			// lists: arrayMove(lists, oldIndex, newIndex),
	  //   }));
		
		let lists = this.state.lists;

		// Sort
		lists = arrayMove(lists, oldIndex, newIndex);

		//console.log(lists);

		var updateObj = {}

		for (var i = 0; i < lists.length; i++) {
			let item = lists[i];

			updateObj[item.id] = {
				...item,
				order: i
			}

			delete updateObj[item.id]['id'];


			if((i + 1) === lists.length){
				// console.log(i, updateObj);

				FirebaseDB
					.ref('/lists/' + this.uid)
					.update(updateObj);
			}

			// FirebaseDB // Not Optimised
			// 	.ref('/lists/' + this.uid + '/' + item.id)
			// 	.set({
			// 		...item,
			// 		order: i
			// 	});
		}

		
	    /*for (var i = 0; i < this.state.lists.length; i++) {
	    	const item = this.state.lists[i];
	    	console.log(i, item.id);
				FirebaseDB
					.ref('/lists/' + this.uid + '/' + item.id)
					.set({
						...item,
						name: result.value
					});
	    }*/
	  };

	
	render() {

		const { isLoading, listName, listType, lists } = this.state;

		if(isLoading){
			return (
				<div className="container">
					<div className="text-center">
						Loading Lists ...
					</div>
				</div>
			)
		}

		return (
			<div className="container">

				<div className="card border-0 shadow-sm mb-3">
					<div className="card-body">
						<div className="input-group">
							<input type="text" value={ listName } className="form-control" placeholder="List Name" onChange={ (e) => this.setState({ listName: e.target.value }) } />
							<select className="form-control" value={ listType } onChange={ (e) => this.setState({ listType: e.target.value }) }>
								<option value="credit">Credit</option>
								<option value="expense">Expense</option>
							</select>
							<div className="input-group-append">
								<button onClick={ this.createList } className="btn btn-light btn-outline-secondary btn-block"><Octicon verticalAlign='middle' icon={iconsByName['plus']}/></button>
							</div>
						</div>
					</div>
				</div>

				<SortableContainer onSortEnd={ this.onSortEnd } pressDelay={ 200 } lockAxis="y" helperClass="shadow-lg">
					{lists.map((item, index) => (
						<SortableItem 
							key={`item-${item.id}`} 
							index={index} 
							item={item} 
							onEdit={ (item) => { this.editList(item) } }
							onRemove={ (item) => { this.removeList(item) } } 
							onShare={ (item) => { this.shareList(item) } } 
						/>
					))}
				</SortableContainer>

			</div>
		);

	}
}

export default Lists;


const SortableItem = sortableElement(({ item, onEdit, onRemove, onShare }) =>{
	const colors = {
		'EXPENSE': '#4caf50',
		'CREDIT': '#ffc107'
	} 
	// return <li>{value.name}</li>
	return (
		<motion.li variants={moItem} className="list-unstyled">
			<div className="card border-0 shadow-sm mb-2" >
				
				<div className="row no-gutters">
					<div className="col-2 text-center p-2 d-flex align-items-center justify-content-center">
						<Avatar chars={ item.type.charAt(0) } color={ colors[item.type.toUpperCase()]  } />	
					</div>
					<div className="col-7 p-2">
						<Link className="text-reset py-2 d-block" to={ `/items/${item.type}/${item.id}` }>{ item.name }</Link>
					</div>
					<div className="col-3 text-right p-2">

						<Dropdown className="btn-link text-secondary">
							<button className="dropdown-item text-center" onClick={ () => { onShare(item) } } >Share</button>
							<button className="dropdown-item text-center" onClick={ () => { onEdit(item) } } >Edit</button>
							<button className="dropdown-item text-center text-danger" onClick={ () => { onRemove(item) } } >Delete</button>
						</Dropdown>

					</div>
				</div>
			</div>
		</motion.li>

	)
});


const SortableContainer = sortableContainer(({ children }) => {
	return <motion.ul 
				className="p-0 m-0 list-unstyled" 
				variants={moContainer}
		    	initial="hidden"
		    	animate="visible"
		    >
		    	{children}
		    </motion.ul>;
});