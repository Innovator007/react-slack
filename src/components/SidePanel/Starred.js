import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { setCurrentChannel, privateChannel } from '../../actions/index';
import { Menu, Icon } from 'semantic-ui-react';

class Starred extends Component {
	state = {
		starredChannels: [],
		user: this.props.currentUser,
		usersRef: firebase.database().ref("users"),
		activeChannel: ''
	}

	componentDidMount() {
		if(this.state.user) {
			this.addListeners(this.state.user.uid);
		}
	}

	componentWillUnmount() {
		this.removeListener();
	}

	removeListener = () => {
		this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
	}

	addListeners = userId => {
		this.state.usersRef.child(userId).child('starred')
			.on('child_added',snap => {
				const starredChannel = { id: snap.key, ...snap.val()};
				this.setState({
					starredChannels: [...this.state.starredChannels, starredChannel]
				});
			});
		this.state.usersRef.child(userId).child('starred')
			.on('child_removed',snap => {
				const channelToRemove = { id: snap.key, ...snap.val()};
				const filteredChannels = this.state.starredChannels.filter(channel => {
					return channel.id !== channelToRemove.id;
				});
				this.setState({ starredChannels: filteredChannels });
			});
	}

	setActiveChannel = channel => {
		this.setState({ activeChannel: channel.id });
	}

	changeChannel = channel => {
		this.setActiveChannel(channel);
		this.props.setCurrentChannel(channel);
		this.props.privateChannel(false);
	}

	render() {
		const { starredChannels } = this.state;
		return (
			<Menu.Menu className="menu">
				<Menu.Item>
					<span>
						<Icon name="star" /> STARRED
					</span>{"  "}
					({ starredChannels.length })
				</Menu.Item>
				{ starredChannels.length > 0 && starredChannels.map(channel => (
					<Menu.Item key={channel.id} name={channel.name} active={channel.id === this.state.activeChannel} style={{opacity: 0.7}} onClick={()=> this.changeChannel(channel)}> 
						# { channel.name }
					</Menu.Item>
				)) }
			</Menu.Menu>
		);
	}
}

export default connect(null, { setCurrentChannel, privateChannel })(Starred);