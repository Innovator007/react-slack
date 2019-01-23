import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions/index';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from 'firebase';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Typing from './Typing';
import Skeleton from './Skeleton';

class Messages extends Component {
	state = {
		messagesRef: firebase.database().ref("messages"),
		privateMessagesRef: firebase.database().ref("privateMessages"),
		messages: [],
		messagesLoading: true,
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		usersRef: firebase.database().ref("users"),
		typingRef: firebase.database().ref("typing"),
		numUniqueUsers: '',
		searchTerm: '',
		isChannelStarred: false,
		searchLoading: false,
		searchResults: [],
		privateChannel: this.props.isPrivateChannel,
		typingUsers: [],
		connectedRef: firebase.database().ref(".info/connected"),
		listeners: []
	}

	componentDidMount() {
		const { channel, user, listeners } = this.state;
		if(channel && user) {
			this.removeListeners(listeners);
			this.addListeners(channel.id);
			this.addUserStarsListener(channel.id, user.uid);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.messagesEnd) {
			this.scrollToBottom();
		}
	}

	componentWillUnmount() {
		this.removeListeners(this.state.listeners);
		this.state.connectedRef.off();
	}

	addToListeners = (id, ref, event) => {
		const index = this.state.listeners.findIndex(listener => {
			return listener.id === id && listener.ref=== ref && listener.event === event;
		})

		if(index === -1) {
			const newListener = { id, ref, event };
			this.setState({ listeners: this.state.listeners.concat(newListener) });
		}
	}

	removeListeners = (listeners) => {
		listeners.forEach(listener => {
			listener.ref.child(listener.id).off(listener.event);
		})
	}

	scrollToBottom = () => {
		this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
	}

	addUserStarsListener = (channelId, userId) => {
		this.state.usersRef.child(userId).child('starred').once("value")
			.then(data => {
				if(data.val() !== null) {
					const channelIds = Object.keys(data.val());
					const prevStarred = channelIds.includes(channelId);
					this.setState({ isChannelStarred: prevStarred });
				}
			})
	}

	addListeners = channelId => {
		this.addMessageListener(channelId);
		this.addTypingListener(channelId);
	}

	addMessageListener = channelId => {
		let loadedMessages = [];
		const ref = this.getMessagesRef();
		ref.child(channelId).on('child_added',snap=> {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
			this.countUniqueUsers(loadedMessages);
			this.countUserPosts(loadedMessages);
		});
		if(!loadedMessages.length) {
			this.setState({ messagesLoading: false });
		}
		this.addToListeners(channelId, ref, 'child_added');
	}

	addTypingListener = channelId => {
		let typingUsers = [];
		this.state.typingRef.child(channelId).on("child_added",snap => {
			if(snap.key !== this.state.user.uid) {
				typingUsers = typingUsers.concat({
					id: snap.key,
					name: snap.val()
				})
				this.setState({ typingUsers });
			}
		});
		this.addToListeners(channelId, this.state.typingRef, 'child_added');

		this.state.typingRef.child(channelId).on("child_removed",snap => {
			const index = typingUsers.findIndex(user => user.id === snap.key);
			if(index !== -1) {
				typingUsers = typingUsers.filter(user => user.id !== snap.key);
				this.setState({ typingUsers });
			}
		});
		this.addToListeners(channelId, this.state.typingRef, 'child_removed');

		this.state.connectedRef.on('value', snap => {
			if(snap.val() === true) {
				this.state.typingRef.child(channelId).child(this.state.user.uid)
					.onDisconnect()
					.remove(err => {
						if(err !== null) {
							console.error(err);

						}
					})
			}
		})
	}

	countUniqueUsers = messages => {
		const uniqueUsers = messages.reduce((acc,message) => {
			if(!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);
		const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
		const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`
		this.setState({ numUniqueUsers });
	}

	countUserPosts = messages => {
		let userPosts = messages.reduce((acc, message) => {
			if(message.user.name in acc) {
				acc[message.user.name].count += 1;
			} else {
				acc[message.user.name] = {
					avatar: message.user.avatar,
					count: 1
				}
			}
			return acc;
		},{});
		this.props.setUserPosts(userPosts);
	}

	displayChannelName = channel => {
		return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
	}

	handleStar = () => {
		this.setState(prevState => ({
			isChannelStarred: !prevState.isChannelStarred
		}), () => this.starChannel());
	}

	starChannel = () => {
		if(this.state.isChannelStarred) {
			this.state.usersRef.child(`${this.state.user.uid}/starred`)
				.update({
					[this.state.channel.id] : {
						name: this.state.channel.name,
						details: this.state.channel.details,
						createdBy: {
							name: this.state.channel.createdBy.name,
							avatar: this.state.channel.createdBy.avatar
						}
					}
				});
		} else {
			this.state.usersRef.child(`${this.state.user.uid}/starred`)
				.child(this.state.channel.id)
				.remove(err => {
					if(err !== null) {
						console.log(err);
					}
				})
		}
	}

	handleSearchChange = event => {
		this.setState({ searchTerm: event.target.value, searchLoading: true }, () => {
			this.handleSearchMessages();
		});
	}

	getMessagesRef = () => {
		const { messagesRef, privateMessagesRef, privateChannel } = this.state;
		return privateChannel ? privateMessagesRef : messagesRef;
	}

	handleSearchMessages = () => {
		const channelMessages = [...this.state.messages];
		const regex = new RegExp(this.state.searchTerm, 'gi');
		const searchResults = channelMessages.reduce((acc, message)=> {
			 // eslint-disable-next-line
			if(message.content && message.content.match(regex) || message.user.name.match(regex)) {
				acc.push(message);
			}
			return acc;
		},[]);
		this.setState({ searchResults });
		setTimeout(() => this.setState({ searchLoading: false }) , 500);
	}

	displayMessages = (messages) => {
		const { user } = this.state;
		return (
			messages.length > 0 && messages.map((message) => {
				return (
					<Message 
						key={message.timestamp} 
						message={message} 
						user={user} 
					/>
				);	
			})
		);
	}

	displayTypingUsers = users => (
		users.length > 0 && users.map(user => (
			<div style={{display: 'flex',alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
				<span className="user__typing">{user.name} is typing</span> <Typing />
			</div>
		))
	);

	displayMessagesSkeleton = loading => (
		loading ? (
			<React.Fragment>
				{ [...Array(10)].map((_, i) => (
					<Skeleton key={i} />
				)) }
			</React.Fragment>
		) : null
	)

	render() {
		const { messagesRef, messages, channel, user, searchLoading, messagesLoading,
			numUniqueUsers, searchTerm, searchResults, privateChannel, isChannelStarred, typingUsers } = this.state;
		return (
			<React.Fragment>
				<MessagesHeader 
					channelName={this.displayChannelName(channel)} 
					users={numUniqueUsers} 
					handleSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
					isPrivateChannel={privateChannel}
					handleStar={this.handleStar}
					isChannelStarred={isChannelStarred}
				/>

				<Segment>
					<Comment.Group className="messages">
					{ this.displayMessagesSkeleton(messagesLoading) }
					{ searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages) }
					{ this.displayTypingUsers(typingUsers) }
					<div ref={node => (this.messagesEnd = node)}>
					</div>
					</Comment.Group>
				</Segment>

				<MessageForm 
					messagesRef={messagesRef} 
					currentUser={user} 
					currentChannel={channel} 
					isPrivateChannel={privateChannel}
					getMessagesRef={this.getMessagesRef}
				/>
			</React.Fragment>
		);
	}
}

export default connect(null, { setUserPosts })(Messages);
