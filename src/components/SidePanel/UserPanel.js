import React from 'react';
import firebase from 'firebase';
import AvatarEditor from 'react-avatar-editor';
import { Grid, Header, Icon, Dropdown, Button, Image, Modal, Input } from 'semantic-ui-react';

class UserPanel extends React.Component {
	state = {
		user: this.props.currentUser,
		modal: false,
		previewImage: '',
		croppedImage: '',
		blob: '',
		storageRef: firebase.storage().ref(),
		usersRef: firebase.auth().currentUser,
		metadata: {
			contentType: 'image/jpeg'
		},
		uploadedCroppedImage: ''
	}

	dropdownOptions() {
		return [
			{
				key: 'user',
				text: <span>Signed in as <strong>{ this.state.user.displayName }</strong></span>,
				disabled: true
			},
			{
				key: 'avatar',
				text: <span onClick={this.openModal}>Change Avatar</span>
			},
			{
				key: 'signout',
				text: <span onClick={this.handleSignOut}>Sign Out</span>
			}
		]
	}

	openModal = () => this.setState({ modal:true });

	closeModal = () => this.setState({ modal: false });

	handleSignOut = () => {
		firebase.auth().signOut().then()
	}

	handleChange = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();

		if(file) {
			reader.readAsDataURL(file);
			reader.addEventListener('load', () => {
				this.setState({ previewImage: reader.result });
			})
		}
	}

	handleCropImage = () => {
		if(this.avatarEditor) {
			this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
				let imageURL = URL.createObjectURL(blob);
				this.setState({ croppedImage: imageURL, blob });
			});
		}
	}

	uploadCroppedImage = () => {
		this.state.storageRef.child(`avatars/users/${this.state.usersRef.uid}`)
			.put(this.state.blob, this.state.metadata)
			.then(snap => {
				snap.ref.getDownloadURL().then(downloadUrl => {
					this.setState({ uploadedCroppedImage: downloadUrl }, () => this.changeAvatar());
				})
			})
	}

	changeAvatar = () => {
		this.state.usersRef.updateProfile({
			photoURL: this.state.uploadedCroppedImage
		}).then(() => {
			console.log("PHOTOURL updated!");
			this.closeModal();
		})
		.catch(err => {
			console.error(err);
		});

		firebase.database().ref("users").child(this.state.user.uid).update({ avatar: this.state.uploadedCroppedImage })
			.then(() => console.log("user avatar updated"))
			.catch(err => console.error(err));
	}

	render() {
		const { user, modal, previewImage, croppedImage } = this.state;
		return (
			<Grid style={{ background: this.props.primaryColor }}>
				<Grid.Column>
					<Grid.Row style={{ padding: '1.2em', margin: 0 }}>
						<Header inverted floated="left" as="h2">
							<Icon name="code" />
							<Header.Content>
								DevChat
							</Header.Content>
						</Header>
						<Header as="h4" inverted style={{ padding: '0.25em' }}>
							<Dropdown trigger={
								<span>
									<Image src={user.photoURL} spaced="right" avatar />
									{ user.displayName }
								</span>
							} options={this.dropdownOptions()} />
						</Header>
					</Grid.Row>

					<Modal basic open={modal} onClose={this.closeModal}>
						<Modal.Header>Change Avatar</Modal.Header>
						<Modal.Content>
							<Input onChange={this.handleChange} type="file" fluid label="New Avatar" name="previewImage" />
							<Grid style={{ background: "transparent" }} centered stackable columns={2}>
								<Grid.Row centered>
									<Grid.Column style={{ background: "transparent" }} className="ui center align grid">
										{ previewImage && (
											<AvatarEditor 
												ref={node => (this.avatarEditor = node)}
												image={previewImage}
												width={120}
												height={120}
												border={50}
												scale={1.2}
											/>
										) }
									</Grid.Column>
									<Grid.Column>
										{ croppedImage && (
											<Image src={croppedImage} style={{margin: '3.5em auto'}} width={100} height={100} />
										) }
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Modal.Content>
						<Modal.Actions>
							{croppedImage && (
								<Button color="green" inverted onClick={this.uploadCroppedImage}>
									<Icon name="save" />
									Change Avatar
								</Button>
							)}
							<Button color="green" inverted onClick={this.handleCropImage}>
								<Icon name="image" />
								Preview Image
							</Button>
							<Button color="red" inverted onClick={this.closeModal}>
								<Icon name="remove" />
								Cancel
							</Button>
						</Modal.Actions>
					</Modal>

				</Grid.Column>
			</Grid>
		);
	}
}

export default UserPanel;