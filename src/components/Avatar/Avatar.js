import React from 'react';
import PropTypes from 'prop-types';

import './Avatar.scss';

const Avatar = ({ className, chars, color }) => {
	return (
		<div className={ `Avatar ${className} ` } style={{ backgroundColor: color }}  >
			{ chars }
		</div>
	)
}

Avatar.defaultProps = {
    className: '',
    chars: 'AL',
    color: '#9c27b0'
}

Avatar.propTypes = {
	className: PropTypes.string,
	chars: PropTypes.string,
	color: PropTypes.string,
	style: PropTypes.any
}

export default Avatar;