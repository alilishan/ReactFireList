import React, { Component } from 'react';
import { Link, NavLink } from "react-router-dom";
import Octicon, {iconsByName} from '@primer/octicons-react';

class Navbar extends Component {

	render() {
		return (

			<nav className="navbar navbar-expand-sm navbar-dark bg-dark fixed-top">
				<div className="container-fluid">
					<Link className="navbar-brand ls-8 ftw-600" to="/">Fire Lists</Link>

					<ul className="navbar-nav mr-auto flex-row">
						<li className="nav-item">
							<NavLink exact={true} className="nav-link ls-8 ftw-600 px-2" to="/">
								<Octicon icon={iconsByName['home']}/>
							</NavLink>
						</li>
						<li className="nav-item">
							<NavLink className="nav-link ls-8 ftw-600 px-2" to="/settings">
								<Octicon icon={iconsByName['gear']}/>
							</NavLink>
						</li>
					</ul>

					<ul className="navbar-nav ml-auto">
						<li className="nav-item">
							<button className="btn btn-link text-light btn-sm ls-8 ftw-600" onClick={ this.props.onSignOut }>
								<Octicon icon={iconsByName['lock']}/>
							</button>
						</li>
					</ul>

				</div>
			</nav>
		);
	}
}

export default Navbar;