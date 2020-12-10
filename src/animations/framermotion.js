import React from 'react';
import { motion, useMotionValue, useTransform } from "framer-motion";
import Octicon, {iconsByName} from '@primer/octicons-react';


export const moContainer = {
	hidden: { opacity: 1, scale: 0 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			delay: 0.3,
			when: "beforeChildren",
			staggerChildren: 0.1
		}
	}
};

export const moItem = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1
	}
};


// https://www.framer.com/api/motion/gestures/
// https://www.framer.com/api/motion/motionvalue/#usetransform

export const SliderItem = (props) => {

	const { className, children, onDragRight, onDragLeft, mode, type } = props;

	console.log(mode, type)

	const x = useMotionValue(0);
	const xInput = [-100, 0, 100];

	const background = useTransform(x, xInput, [
		// "linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%)",
		// "linear-gradient(180deg, #7700ff 0%, rgb(68, 0, 255) 100%)",
		// "linear-gradient(180deg, rgb(230, 255, 0) 0%, rgb(3, 209, 0) 100%)"
		'#DC3545',	// RED
		'#EFEFEF', // GRAY
		mode === 'expense'? type === 'pending'? '#28A745' : '#007BFF' : '#EFEFEF' // GREEN, BLUE, GRAY
	]);

	const scale = useTransform(x, [-100, 0, 100], [1, .5, 1], {
		clamp: false
	});

	const onDragEnd = (event, info) => {
		// console.log(info.point.x, info.point.y)
		if(info.point.x < -100){
			// console.log('Delete');
			onDragLeft.call();
			return false;
		}

		if(info.point.x > 100){
			if(mode === 'expense') onDragRight.call();
			return false;
		}
	}

	return (
		<motion.div className="slidable-container" style={{ background }}>
			<motion.div className="slidable-icon accept" style={{ scale }}>
				{ type === 'pending' ? 
					<Octicon icon={iconsByName['check']}/> : 
					<Octicon icon={iconsByName['issue-reopened']}/>
				}
			</motion.div>
			<motion.div className="slidable-icon reject" style={{ scale }}>
				<Octicon icon={iconsByName['trashcan']}/>
			</motion.div>
			<motion.div
		        className={ `slidable-item ${className} ` }
		        style={{ x }}
		        drag="x"
		        dragConstraints={{ left: 0, right: 0 }}
		        dragElastic={ 0.5 }
		        onDragEnd={ onDragEnd }
		        dragDirectionLock
			>

				{ children }
			
			</motion.div>
		</motion.div>
	)	

}

