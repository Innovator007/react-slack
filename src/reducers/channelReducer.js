import { SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL, SET_USER_POSTS } from '../actions/types';

const INITIAL_CHANNEL = {
	currentChannel: null,
	isPrivateChannel: false,
	userposts: null
}

export default (state=INITIAL_CHANNEL,action) => {
	switch(action.type) {
		case SET_CURRENT_CHANNEL:
			return { ...state, currentChannel: action.payload.currentChannel };
		case SET_PRIVATE_CHANNEL:
			return { ...state, isPrivateChannel: action.payload.isPrivateChannel };
		case SET_USER_POSTS:
			return { ...state, userposts: action.payload.userposts };
		default:
			return state;
	}
}