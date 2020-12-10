import React, { Component } from 'react';
import Moment from 'react-moment';
import Octicon, {iconsByName} from '@primer/octicons-react';
import { motion } from "framer-motion";
import NumberFormat from 'react-number-format';

import AuthContext from '../context/AuthContext';
import { FirebaseDB } from '../firebase';
import { SwalToast, SwalConfirm } from './Helpers';
import { moItem, moContainer } from '../animations/framermotion'; //SliderItem


class Items extends Component {
	static contextType = AuthContext;

	constructor(props) {
		super(props);
		
		this.fdbListRef = null;
		this.nameInput = null;
		this.listType = this.props.match.params.listType;
		this.listId = this.props.match.params.listId;
		
		this.state = {
			isLoading: true,
			isOwner: true,
			itemText: '',
			itemAmount: '',
			itemType: 'expense',
			items: [],
			listName: ''
		};

		this.createItem = this.createItem.bind(this);
		this.itemSetPaid = this.itemSetPaid.bind(this);
		this.itemRemove = this.itemRemove.bind(this);
	}


	componentDidMount(){
		this.checkOwner();
		this.getItems();
	}

	
	componentWillUnmount(){
		// Detach Firebase Listners
		if(this.fdbListRef !== null) this.fdbListRef.off();
	}


	checkOwner(){
		const { user } = this.context;

		FirebaseDB
			.ref('/lists/' + user.uid + '/' + this.listId)
			.once('value')
			.then( snapshot => {

				if(snapshot.val() === null){
					this.setState({ isOwner: false });
					this.getListName({ uid: user.uid, listId: this.listId });
				} else {
					this.setState({ 
						isOwner: true,
						listName: snapshot.val().name 
					});
				}

			}, error => {
				this.setState({ isOwner: false });
			});
	}


	getListName(data){

		FirebaseDB
			.ref('/shared/' + data.uid + '/' + data.listId)
			.once('value')
			.then( snapshot => {
				if(snapshot.val() !== null){
					this.setState({ listName: snapshot.val().name });
				}
			}, error => {
				this.setState({ isOwner: false });
			});
	}


	getItems(){

		this.fdbListRef = FirebaseDB
			.ref('/items/' + this.listId);

		this.fdbListRef.on("value", (snapshot) => {

				let _items = [];

				if(snapshot.val() !== null){
					const _snap = snapshot.val();
					const _keys = Object.keys(_snap)
					
					_items = _keys.map((key) => {
						return { id: key, ..._snap[key] };
					});
				}

				
				this.setState({ 
					isLoading: false,
					items: _items, 
				});

				// if(this.nameInput !== null) this.nameInput.focus();
			
			}, (errorObject) => {
				SwalToast("The read failed: " + errorObject.code, 'error');
			});
	}


	createItem(){
		if(this.state.itemText === ''){
			SwalToast('Please Provide an Item Name', 'error');	
			return false;
		} 

		if(this.state.itemAmount === '' || this.state.itemAmount === 0){
			SwalToast('Please Provide an Amount', 'error');	
			return false;
		}

		FirebaseDB
			.ref('/items/' + this.listId)
			.push({
				name: this.state.itemText,
				amount: parseInt(this.state.itemAmount),
				type: this.state.itemType,
				paid: false,
				paidTimestamp: null,
				order: 0,
				created: new Date().getTime()
			});

		this.setState({
			itemText: '',
			itemAmount: '',
		});

		if(this.nameInput !== null) this.nameInput.focus();
	}

	
	itemSetPaid(item, value){

		let _updateObj = {
			// ...item, using update() instead of set()
			paid: value,
			paidTimestamp: new Date().getTime()
		}

		// Delete the Id
		// delete _updateObj['id'];

		// Update to Firebase	
		FirebaseDB
			.ref('/items/' + this.listId + '/' + item.id)
			.update(_updateObj);	
	}
	

	itemRemove(item, value){
		SwalConfirm()
			.then(() => {
				// You can also delete by specifying null as the value for another write operation such as set()
				FirebaseDB
					.ref('/items/' + this.listId + '/' + item.id)
					.set(null);	
			}, () => { });
	}
	

	render() {

		const { isLoading, isOwner, itemText, itemAmount, itemType, items, listName } = this.state;
		let total = 0, paid = 0, pending = 0;
		let pendingItems = [], paidItems = [];
		let expenseItems = [], paymentItems = [];

		// paidItems = items.filter((item) => { return item.paid; });

		if(this.listType === 'expense'){
			for (var i = 0; i < items.length; i++) {
				total += items[i].amount;

				if(items[i].paid){
					paid += items[i].amount; 
					paidItems.push(items[i]);
				} else {
					pendingItems.push(items[i]);
				}
			}

			pending = total - paid;
		}


		if(this.listType === 'credit'){
			for (var k = 0; k < items.length; k++) {
				
				if(items[k].type === 'expense'){
					total += items[k].amount;
					expenseItems.push(items[k]);
				}

				if(items[k].type === 'payment'){
					paid += items[k].amount;
					paymentItems.push(items[k]);
				}
			}

			pending = total - paid;
		}
		

		if(isLoading){
			return (
				<div className="container">
					<div className="text-center">
						Loading Items ...
					</div>
				</div>
			)
		}

		return (
			<div className="container">

				<small className="d-block text-muted ls-8 py-3">List: { listName }</small>	

				<div className="card border-0 shadow-sm mb-3">

					{ isOwner && 
						<ListInput
							text={ itemText }
							amount={ itemAmount } 
							type={ itemType } 
							mode={ this.listType } 
							onCreate={ this.createItem  } 
							onSetState={ (value) => this.setState(value)  } 
							onRef={ (input) => { this.nameInput = input; } }
						/>
					}
					
					<ListDetails
						mode={ this.listType } 
						total={ total } 
						paid={ paid } 
						pending={ pending }
					/>

				</div>


				{this.listType === 'expense' &&
					<div>
						<div className="card border-0 shadow-sm mb-3">
							<div className="card-header bg-light"><small className="text-uppercase text-dark ftw-600 ls-8">Pending</small></div>
							<ListItems mode={ this.listType } type="pending" isOwner={ isOwner } items={ pendingItems } onPay={ this.itemSetPaid } onRemove={ this.itemRemove } />
						</div>

						<div className="card border-0 shadow-sm mb-3">
							<div className="card-header bg-light"><small className="text-uppercase text-dark ftw-600 ls-8">Paid</small></div>
							<ListItems mode={ this.listType } type="paid" isOwner={ isOwner } items={ paidItems } onPay={ this.itemSetPaid } onRemove={ this.itemRemove } />
						</div>
					</div>
				}

				{this.listType === 'credit' &&
					<div>
						<div className="card border-0 shadow-sm mb-3">
							<div className="card-header bg-light"><small className="text-uppercase text-dark ftw-600 ls-8">Expense</small></div>
							<ListItems mode={ this.listType } type="pending" isOwner={ isOwner } items={ expenseItems } onPay={ this.itemSetPaid } onRemove={ this.itemRemove } />
						</div>

						<div className="card border-0 shadow-sm mb-3">
							<div className="card-header bg-light"><small className="text-uppercase text-dark ftw-600 ls-8">Payments</small></div>
							<ListItems mode={ this.listType } type="paid" isOwner={ isOwner } items={ paymentItems } onPay={ this.itemSetPaid } onRemove={ this.itemRemove } />
						</div>
					</div>
				}


			</div>
		);
	}
}

export default  Items;



const ListDetails = (props) => {
	const { total, paid, pending } = props;
	return (
		<ul className="list-group list-group-flush">
			<li className="list-group-item text-uppercase ftw-600 text-dark ls-8">
				{/* Pending: { pending } */}
				Pending: <NumberFormat value={ pending } displayType={'text'} thousandSeparator={true} prefix={''} />
			</li>
			<li className="list-group-item text-uppercase ftw-600">
				<small className="text-dark ftw-600 ls-8">Paid: </small>
				<small>{ paid }</small>
			</li>
			<li className="list-group-item text-uppercase ftw-600">
				<small className="text-dark ftw-600 ls-8">Total: </small>
				<small>{ total }</small>
			</li>
		</ul>
	)
}


const ListItems = (props) => {
	const { mode, type, items, onPay, onRemove, isOwner } = props;

	/*const x = useMotionValue(0);
	const xInput = [-100, 0, 100];
	const background = useTransform(x, xInput, [
		"linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%)",
		"linear-gradient(180deg, #7700ff 0%, rgb(68, 0, 255) 100%)",
		"linear-gradient(180deg, rgb(230, 255, 0) 0%, rgb(3, 209, 0) 100%)"
	]);
	const ref = useRef(null);*/

	return (

			<motion.ul 
				className="p-0 m-0 list-unstyled list-group list-group-flush" 
				variants={moContainer}
		    	initial="hidden"
		    	animate="visible"
		    >
			{ items.map((item, index) => (
				
				<motion.li key={ index } variants={moItem} className="list-unstyled list-group-item ls-8 p-0">
					
					{/*<SliderItem 
						className="p-3 bg-white"
						mode={ mode } 
						type={ type } 
						onDragRight={ () => onPay(item, (mode === 'expense' && type === 'pending')? true : false) } 
						onDragLeft={ () => onRemove(item) } 
					>*/}

					<div className="p-3">
						{ isOwner &&
							<div className="float-right">
								{(mode === 'expense' && type === 'paid') && <button 
									className="btn btn-link" 
									onClick={ () => { onPay(item, false) } }
								>
									<Octicon icon={iconsByName['issue-reopened']}/>
								</button>}

								{(mode === 'expense' && type === 'pending') &&
									<button 
										className="btn btn-link text-success" 
										onClick={ () => onPay(item, true) }
									>
										<Octicon icon={iconsByName['check']}/>
									</button>
								}

								<button 
									className="btn btn-link text-danger" 
									onClick={ () => onRemove(item) }
								>
									<Octicon icon={iconsByName['trashcan']}/>
								</button>
							</div>
						}
						<span><NumberFormat value={item.amount} displayType={'text'} thousandSeparator={true} prefix={''} /> - { item.name }</span>
						<small className="text-muted d-block"><Moment format="DD, MMM YYYY">{ item.created }</Moment></small>
					
					</div>	
					{/*</SliderItem>*/}

				</motion.li>

			))}
		</motion.ul>

	)
}



const ListInput = (props) => {
	const { mode, onCreate, onSetState, onRef, text, amount, type } = props;

	return (

		<div className="card-body pb-0">
			<div className="input-group">
				<input type="text" placeholder="Name" className="form-control"
					ref={(input) => { onRef(input); }} 
					value={ text } 
					onChange={ (e) => onSetState({ itemText: e.target.value }) }
				/>
				<input type="number" value={ amount } className="form-control" placeholder="Amount" onChange={ (e) => onSetState({ itemAmount: e.target.value }) } />
				
				{mode === 'credit' && <select className="form-control" value={ type } onChange={ (e) => onSetState({ itemType: e.target.value }) }>
					<option value="payment">Payment</option>
					<option value="expense">Expense</option>
				</select>}

				<div className="input-group-append">
					<button onClick={ onCreate } className="btn btn-light btn-outline-secondary btn-block"><Octicon verticalAlign='middle' icon={iconsByName['plus']}/></button>
				</div>
			</div>
		</div>

	)
}