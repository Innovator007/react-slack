import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import registerServiceWorker from './registerServiceWorker';
import "semantic-ui-css/semantic.min.css";
import firebase from 'firebase';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';
import reducer from './reducers/index';
import { setUser, clearUser } from './actions/index';
import Spinner from './Spinner';

class Root extends Component {
	componentWillMount() {
		var config = {
			apiKey: "AIzaSyB9hfH7pnoauKq98RFW69mDHkqHvPtJs_8",
			authDomain: "react-slack-ffcff.firebaseapp.com",
			databaseURL: "https://react-slack-ffcff.firebaseio.com",
			projectId: "react-slack-ffcff",
			storageBucket: "react-slack-ffcff.appspot.com",
			messagingSenderId: "312870714056"
		};
		firebase.initializeApp(config);
	}
	componentDidMount() {
		firebase.auth().onAuthStateChanged(user => {
			if(user) {
				this.props.setUser(user);
				this.props.history.push("/");
			} else {
				this.props.history.push("/login");
				this.props.clearUser();
			}
		})
	}
	render() {
		return this.props.isLoading ? <Spinner /> : (
			<Switch>
				<Route path="/" exact component={App} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
			</Switch>
		);
	}
}

const mapStateToProps = state => {
	return { isLoading: state.user.isLoading };
}


const RootWithAuth = withRouter(connect(mapStateToProps,{ setUser, clearUser })(Root));

ReactDOM.render(
	<Provider store={createStore(reducer)}>
		<Router>
			<RootWithAuth />
		</Router>
	</Provider>, 
	document.getElementById('root'));
registerServiceWorker();
