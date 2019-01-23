import React from 'react';
import firebase from 'firebase';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';
import { Picker, emojiIndex } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

class MessageForm extends React.Component {
	state = {
		message: '',
		loading: false,
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		typingRef: firebase.database().ref("typing"),
		errors: [],
		percentUploaded: 0,
		modal: false,
		uploadState: '',
		uploadTask: null,
		storageRef: firebase.storage().ref(),
		emojiPicker: false
	}

	componentWillUnmount() {
		if(this.state.uploadTask !== null) {
			this.state.uploadTask.cancel();
			this.setState({ uploadTask: null });
		}
	}

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	handleChange = (event) => {
		this.setState({ [event.target.name] : event.target.value });
	}

	createMessage = (fileUrl = null) => {
		const { user } = this.state;
		const message = {
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: user.uid,
				name: user.displayName,
				avatar: user.photoURL
			},
		}
		if(fileUrl !== null) {
			message['image'] = fileUrl;
		} else {
			message['content'] = this.state.message;
		}
		return message;
	}

	sendMessage = () => {
		const { message, channel, typingRef, user } = this.state;
		const { getMessagesRef } = this.props;
		if(message) {
			this.setState({ loading: true });
			getMessagesRef().child(channel.id).push().set(this.createMessage())
				.then(() => {
					this.setState({ loading: false, message: '', errors: [] });
					typingRef.child(channel.id).child(user.uid)
						.remove();
				})
				.catch(err => {
					console.error(err);
					this.setState({
						loading: false,
						errors: this.state.errors.concat(err)
					});
				});
		} else {
			this.setState({ errors: this.state.errors.concat({ message: 'Add a message' }) })
		}
	}

	getPath = () => {
		if(this.props.isPrivateChannel) {
			return `chat/private/${this.state.channel.id}`
		} else {
			return 'chat/public';
		}
	}

	uploadFile = (file,metadata) => {
		const pathToUpload = this.state.channel.id;
		const ref = this.props.getMessagesRef();
		const filePath = `${this.getPath()}/${file.name}`;
		this.setState({	uploadState: 'uploading', uploadTask: this.state.storageRef.child(filePath).put(file,metadata)},() => {
			let count = 0;
			let percentUploaded;
			this.state.uploadTask.on("state_changed", snap => {
				percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
			},err => (this.setState({ errors: this.state.errors.concat(err), uploadState: 'error', uploadTask: null })),()=> {
				this.setState({ percentUploaded },(err) => {
					if(err) {
						console.error(err);
					}
					this.state.uploadTask.snapshot.ref.getDownloadURL()
						.then(downloadUrl => {
							count++;
							if(count === 1) {
								this.sendFileMessage(downloadUrl, ref, pathToUpload);
							}
						})
						.catch(err => {
							console.log("In catch block")
							console.error(err)
							this.setState({ errors: this.state.errors.concat(err), uploadState: 'error', uploadTask: null })
						});
				});
			});
		});
	}

	sendFileMessage = (fileUrl, ref, uploadPath) => {
		console.log(fileUrl,ref,uploadPath);
		ref.child(uploadPath)
			.push()
			.set(this.createMessage(fileUrl))
			.then(() => {
				this.setState({ uploadState: 'done' });
			})
			.catch(err => {
				console.error(err);
				this.setState({
					errors: this.state.errors.concat(err)
				});
			});
	}

	handleKeyDown = (event) => {
		if(event.keyCode === 13) {
			this.sendMessage();
		}
		const { message, typingRef, channel, user } = this.state;
		if(message) {
			typingRef.child(channel.id).child(user.uid)
				.set(user.displayName);
		} else {
			typingRef.child(channel.id).child(user.uid)
				.remove();
		}
	}

	handleTogglePicker = () => {
		this.setState({ emojiPicker: !this.state.emojiPicker });
	}

	handleAddEmoji = emoji => {
		const oldMessage = this.state.message;
		const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
		this.setState({ message: newMessage, emojiPicker: false });
		setTimeout(() => this.messageInputRef.focus(), 0);
	}

	colonToUnicode = message => {
		return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
			x = x.replace(/:/g, "");
			let emoji = emojiIndex.emojis[x];
			if(typeof emoji !== "undefined") {
				let unicode = emoji.native;
				if(typeof unicode !== "undefined") {
					return unicode;
				}
			}
			x = ":" + x + ":";
			return x;
		});
	};

	render() {
		 // eslint-disable-next-line
		const { errors, message, loading, modal, uploadState, percentUploaded, emojiPicker } = this.state;
		return (
			<Segment className="message__form">
				{ emojiPicker && (
					<Picker 
						set="messenger"
						onSelect={this.handleAddEmoji}
						className="emojipicker"
						title="Pick your emoji"
						emoji="point_up"
					/>
				) }
				<Input 
					fluid 
					value={message}
					name="message" 
					ref={node => (this.messageInputRef = node)}
					onChange={this.handleChange}
					onKeyDown={this.handleKeyDown}
					style={{ marginBottom:'0.7em' }} 
					label={<Button icon={ emojiPicker ? 'close' : 'add' } content={ emojiPicker ? 'Close' : null }  onClick={this.handleTogglePicker} />} 
					labelPosition="left" 
					placeholder="Write your message..."
				/>
				<Button.Group icon widths="2">
					<Button 
						onClick={this.sendMessage}
						color="orange"
						content="Add Reply"
						labelPosition="left"
						icon="edit"
						disabled={loading}
					/>
					<Button 
						color="teal"
						disabled={uploadState === 'uploading'}
						onClick={this.openModal}
						content="Upload Media"
						labelPosition="right"
						icon="cloud upload"
					/>
					</Button.Group>
					<FileModal 
						modal={modal}
						closeModal={this.closeModal}
						uploadFile={this.uploadFile}
					/>
					<ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />
			</Segment>
		);
	}
}

export default MessageForm;