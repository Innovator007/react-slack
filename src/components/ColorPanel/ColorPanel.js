import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux';
import { setColors } from '../../actions/index'; 
import { Sidebar, Menu, Divider, Button, Modal, Icon, Segment, Label } from 'semantic-ui-react';
import { SliderPicker } from 'react-color';

class ColorPanel extends Component {
	state = {
		modal: false,
		primary: '#4c3c4c',
		secondary: '#eee',
		user: this.props.currentUser,
		usersRef: firebase.database().ref("users"),
		userColors: [],
		vertical: true
	}

	componentDidMount() {
		if(this.state.user) {
			this.addListener(this.state.user.uid);
		}
	}

	componentWillUnmount() {
		this.removeListener();
	}

	removeListener = () => {
		this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
	}

	addListener = userId => {
		let userColors = [];
		this.state.usersRef.child(`${userId}/colors`)
			.on('child_added', snap => {
				userColors.unshift(snap.val());
				this.setState({ userColors });
			})
	}

	openModal = () => {
		this.setState({ modal: true });
	}

	closeModal = () => {
		this.setState({ modal: false });
	}

	handlePrimary = color => {
		this.setState({ primary: color.hex });
	}

	handleSecondary = color => {
		this.setState({ secondary: color.hex });
	}

	handleSave = () => {
		const { primary, secondary } = this.state;
		if(primary && secondary) {
			this.saveColors(primary,secondary);
		}
	}

	displayUserColors = colors => (
		colors.length > 0 && colors.map((color,i) => (
			<React.Fragment key={i}>
				<Divider />
				<div className="color__container border" onClick={() => this.props.setColors(color.primary,color.secondary)}>
					<div className="color__square" style={{background: color.primary}}>
						<div className="color__overlay" style={{background: color.secondary}}>
						</div>
					</div>
				</div>
			</React.Fragment>
		))
	)

	saveColors = (primary,secondary) => {
		this.state.usersRef
			.child(`${this.state.user.uid}/colors`)
			.push()
			.update({
				primary,
				secondary
			})
			.then(() => {
				console.log('Colors added!')
				this.closeModal();
			})
			.catch(err => console.error(err));
	}

	render() {
		const { modal, primary, secondary, userColors, vertical } = this.state;
		return (
			<Sidebar style={{ padding: "0.5em" }} as={Menu} icon="labeled" inverted vertical={vertical} visible width="very thin">
				<Divider />
				<Button icon="add" color="blue" size="small" onClick={this.openModal} />
				<React.Fragment key={1000}>
					<Divider />
					<div className="color__container border" onClick={() => this.props.setColors("#4c3c4c","#eee")}>
						<div className="color__square" style={{background:"#4c3c4c"}}>
							<div className="color__overlay" style={{background: "#eee"}}>
							</div>
						</div>
					</div>
				</React.Fragment>
				{ this.displayUserColors(userColors) }
				<Modal basic open={modal} onClose={this.closeModal}>
					<Modal.Header>
						Choose App Colors
					</Modal.Header>
					<Modal.Content>
						
						<Segment inverted>
							<Label content="Primary Color" />
							<SliderPicker color={primary} onChangeComplete={this.handlePrimary} />
						</Segment>

						<Segment inverted>
							<Label content="Secondary Color" />
							<SliderPicker color={secondary} onChangeComplete={this.handleSecondary} />
						</Segment>
					
					</Modal.Content>
					<Modal.Actions>
						<Button color="green" inverted onClick={this.handleSave}><Icon name="checkmark" />Save Colors</Button>
						<Button color="red" inverted onClick={this.closeModal}><Icon name="remove" />Cancel</Button>
					</Modal.Actions>
				</Modal>

			</Sidebar>
		);
	}
}

export default connect(null,{ setColors })(ColorPanel);
