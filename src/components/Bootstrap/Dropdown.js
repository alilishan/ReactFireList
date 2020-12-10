import React, { useState, useRef, useEffect } from 'react';
import Octicon, {iconsByName} from '@primer/octicons-react';

import './Dropdown.scss';

const Dropdown = ({ children, className }) => {
	const [open, setOpen] = useState(false);
	const dropElement = useRef(null);

	useEffect(() => {
		document.addEventListener("mousedown", handleClick);


		return () => {
			document.removeEventListener("mousedown", handleClick);
		}

	}, []);

	const handleClick = e => {
		if (dropElement.current.contains(e.target)) {
			return;
		}
		
		setOpen(false);
	};

	return (
		<div ref={dropElement} className={ `dropdown fancy-dropdown d-inline-block ${open? 'show' : ''}` }>
			<button className={ `btn ${className}` } type="button" onClick={ () => setOpen(open ? false : true) }>
				<Octicon verticalAlign='middle' icon={iconsByName['kebab-vertical']}/>
			</button>
			<div className={ 'dropdown-menu dropdown-menu-right ' + ( open? ' show ' : '' ) } aria-labelledby="dropdownMenuButton">
				{ children }
			</div>
		</div>
	);
}

Dropdown.defaultProps = {
	className:''
}


export default Dropdown;