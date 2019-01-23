import React, { Component } from 'react';
import firebase from 'firebase';
import md5 from 'md5';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Register extends Component {
	state = {
		username: '',
		email: '',
		password: '',
		passwordConfirmation: '',
		errors: [],
		loading: false,
		usersRef: firebase.database().ref("users")
	}

	isFormValid = () => {
		let errors = [];
		let error;
		if(this.isFormEmpty(this.state)) {
			error = { message: "Fill in all the fields" }
			this.setState({ errors: errors.concat(error) });
			return false;
		} else if (!this.isPasswordValid(this.state)) {
			error = { message: "Passwords is invalid" }
			this.setState({ errors: errors.concat(error) });
			return false;
		} else {
			return true;
		}
	}

	isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
		return !username.length || !email.length || !password.length || !passwordConfirmation.length;
	}

	isPasswordValid = ({ password, passwordConfirmation }) => {
		if(password.length < 6 || passwordConfirmation.length < 6) {
			return false;
		} else if (password !== passwordConfirmation) {
			return false;
		} else {
			return true;
		}
	}

	handleChange = event => {
		this.setState({ [event.target.name] : event.target.value });
	};

	handleSubmit = event => {
		event.preventDefault();
		if(this.isFormValid()) {
			this.setState({ errors: [], loading: true });
			const { email, password } = this.state;
			firebase.auth().createUserWithEmailAndPassword(email,password)
				.then(createdUser => {
					createdUser.user.updateProfile({
						displayName: this.state.username,
						photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
					})
					.then(() => {
						this.saveUser(createdUser).then(() => {
							this.setState({ errors: [], loading:false });
							console.log("User Saved Successfully!");
						});
					})
					.catch(err => {
						console.error(err);
						this.setState({ errors: this.state.errors.concat(err),loading:false });
					});
				})
				.catch(err => {
					console.error(err)
					this.setState({ errors: this.state.errors.concat(err), loading: false });
				});
		}
	};

	saveUser = createdUser => {
		return this.state.usersRef.child(createdUser.user.uid).set({
			name: createdUser.user.displayName,
			avatar: createdUser.user.photoURL
		});
	}

	handleInputError = (errors,inputName) => {
		return errors.some(error => error.message.toLowerCase().includes(inputName) || error.message.toLowerCase().includes('fields')) ? 'error' : ''
	}

	render() {
		const { username, email, password, passwordConfirmation, errors, loading } = this.state;
		return (
			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h1" icon color="orange" textAlign="center">
						<Icon name="puzzle piece" color="orange" />
						Register for DevChat
					</Header>
					<Form onSubmit={this.handleSubmit} size="large">
						<Segment stacked>
							<Form.Input 
								fluid 
								name="username" 
								icon="user" 
								iconPosition="left" 
								placeholder="Username" 
								onChange={this.handleChange}
								value={username}
								className={this.handleInputError(errors,'username')}
								type="text"
							/>
							<Form.Input 
								fluid 
								name="email" 
								icon="mail" 
								iconPosition="left" 
								placeholder="someoneawesome@gmail.com" 
								onChange={this.handleChange}
								value={email}
								className={this.handleInputError(errors,'email')}
								type="email"
							/>
							<Form.Input 
								fluid 
								name="password" 
								icon="lock" 
								iconPosition="left" 
								placeholder="Password" 
								onChange={this.handleChange}
								value={password}
								className={this.handleInputError(errors,'password')}
								type="password"
							/>
							<Form.Input 
								fluid 
								name="passwordConfirmation" 
								icon="repeat" 
								iconPosition="left" 
								placeholder="Confirm Password" 
								onChange={this.handleChange}
								value={passwordConfirmation}
								className={this.handleInputError(errors,'password')}
								type="password"
							/>
							<Button disabled={loading} className={ loading ? 'loading' : '' } color="orange" fluid size="large">
								Register
							</Button>
						</Segment>
					</Form>
					<Message>Already a user? <Link to="/login">Login</Link></Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Register;