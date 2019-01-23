import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { setCurrentChannel, privateChannel } from '../../actions/index';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';

class Channels extends Component {
	state = {
		currentUser: this.props.currentUser,
		channels: [],
		showModal: false,
		channel: null,
		messagesRef: firebase.database().ref("messages"),
		typingRef: firebase.database().ref("typing"),
		notifications: [],
		channelName: '',
		channelDetail: '',
		channelsRef: firebase.database().ref("channels"),
		firstLoad: true,
		activeChannel: ''
	}

	componentDidMount() {
		this.addListeners();
	}

	componentWillUnmount() {
		this.removeListeners();
	}

	addListeners = () => {
		const loadedChannels = [];
		this.state.channelsRef.on('child_added', snap => {
			loadedChannels.push(snap.val())
			this.setState({ channels: loadedChannels },() => this.setFirstChannel());
			this.addNotificationListener(snap.key);
		});
	}

	addNotificationListener = channelId => {
		this.state.messagesRef.child(channelId).on('value', snap => {
			if(this.state.channel) {
				this.handleNotification(channelId,this.state.channel.id, this.state.notifications,snap);
			}
		});
	}

	handleNotification = (channelId, currentChannelId, notifications, snap) => {
		let lasttotal = 0;
		// console.log(channelId, currentChannelId, notifications,snap);
		let index = notifications.findIndex(notification => notification.id === channelId);
		if(index !== -1) {
			if(channelId !== currentChannelId) {
				lasttotal = notifications[index].total;
				if(snap.numChildren() - lasttotal > 0) {
					notifications[index].count = snap.numChildren() - lasttotal;
				}
			}
			notifications[index].lastKnownTotal = snap.numChildren();
		} else {
			notifications.push({
				id: channelId,
				total: snap.numChildren(),
				lastKnownTotal: snap.numChildren(),
				count: 0 
			})
		}
		this.setState({ notifications });
	}

	removeListeners = () => {
		this.state.channelsRef.off();
		this.state.channels.forEach(channel => {
			this.state.messagesRef.child(channel.id).off();
		})
	}

	setFirstChannel = () => {
		const firstChannel = this.state.channels[0];
		if(this.state.firstLoad && this.state.channels.length>0) {
			this.props.setCurrentChannel(firstChannel);
			this.setActiveChannel(firstChannel);
			this.setState({ channel: firstChannel });
		}
		this.setState({ firstLoad: false });
	}

	addChannel = () => {
		const { channelsRef, channelName, channelDetail, currentUser } = this.state;
		const key = channelsRef.push().key;
		const newChannel = {
			id: key,
			name: channelName,
			details: channelDetail,
			createdBy: {
				name: currentUser.displayName,
				avatar: currentUser.photoURL
			}
		};
		channelsRef.child(key).update(newChannel)
			.then(() => {
				this.setState({ channelName: '',channelDetail: '' })
				this.onModalClose();
				console.log("Channel Added!");
			})
			.catch(err => {
				console.error(err);
			});
	}	

	handleSubmit = (event) => {
		event.preventDefault();
		if(this.isFormValid(this.state)) {
			this.addChannel();
		}
	}

	isFormValid = ({ channelName, channelDetail }) => channelName && channelDetail;

	onModalClose = () => {
		this.setState({ showModal: false });
	}

	onModalShow = () => {
		this.setState({ showModal: true });
	}

	handleChange = (event) => {
		this.setState({ [event.target.name] : event.target.value });
	}

	changeChannel = channel => {
		this.setActiveChannel(channel);
		this.state.typingRef.child(this.state.channel.id).child(this.state.currentUser.uid).remove()
		this.clearNotifications();
		this.props.setCurrentChannel(channel);
		this.props.privateChannel(false);
		this.setState({ channel });
	}

	clearNotifications = () => {
		let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)
		if(index !== -1) {
			let updatedNotifications = [...this.state.notifications];
			updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
			updatedNotifications[index].count = 0;
			this.setState({ notifications: updatedNotifications });
		}
	}

	getNotificationCount = channel => {
		let count = 0;
		this.state.notifications.forEach(function(notification) {
			if(notification.id === channel.id) {
				count = notification.count;
			}
		});
		if(count > 0) return count;
	}

	setActiveChannel = channel => {
		this.setState({ activeChannel: channel.id });
	}

	render() {
		const { channels, showModal } = this.state;
		return (
			<React.Fragment>
			<Menu.Menu className="menu">
				<Menu.Item>
					<span>
						<Icon name="exchange" /> CHANNELS
					</span>{"  "}
					({ channels.length }) <Icon name="add" style={{ cursor: 'pointer' }} onClick={this.onModalShow} />
				</Menu.Item>
				{ channels.length > 0 && channels.map(channel => (
					<Menu.Item key={channel.id} name={channel.name} active={channel.id === this.state.activeChannel} style={{opacity: 0.7}} onClick={()=> this.changeChannel(channel)}>
						# { channel.name }
						{ this.getNotificationCount(channel) && (<Label color="green">{ this.getNotificationCount(channel) }</Label>) } 
					</Menu.Item>
				)) }
			</Menu.Menu>

			<Modal basic open={showModal} onClose={this.onModalClose}>
				<Modal.Header>
					Add a Channel
				</Modal.Header>
				<Modal.Content>
					<Form onSubmit={this.handleSubmit}>
						<Form.Field>
							<Input fluid label="Name of Channel" name="channelName" onChange={this.handleChange} />
						</Form.Field>
						<Form.Field>
							<Input fluid label="About the Channel" name="channelDetail" onChange={this.handleChange} />
						</Form.Field>
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button color="green" inverted onClick={this.handleSubmit}>
						<Icon name="checkmark" /> Add
					</Button>
					<Button color="red" inverted onClick={this.onModalClose}>
						<Icon name="remove" /> Cancel
					</Button>
				</Modal.Actions>
			</Modal>
			</React.Fragment>
		);
	}
}

export default connect(null, { setCurrentChannel, privateChannel })(Channels);