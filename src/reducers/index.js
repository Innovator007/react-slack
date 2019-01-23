import { combineReducers } from 'redux';
import userReducer from './userReducer';
import channelReducer from './channelReducer';
import colorReducer from './colorReducer';

export default combineReducers({
	user: userReducer,
	channel: channelReducer,
	colors: colorReducer
});

