import { SET_COLORS } from '../actions/types';

const INITIAL_COLORS = {
	primaryColor: '#4c3c4c',
	secondaryColor: '#eee'
}

export default (state = INITIAL_COLORS,action) => {
	switch(action.type) {
		case SET_COLORS:
			return { 
				primaryColor: action.payload.primaryColor, 
				secondaryColor: action.payload.secondaryColor 
			};
		default:
			return state;
	}
} 