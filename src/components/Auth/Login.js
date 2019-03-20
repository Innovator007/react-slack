import React, { Component } from 'react';
import firebase from 'firebase';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Login extends Component {
	state = {
		email: '',
		password: '',
		errors: [],
		loading: false
	}

	handleChange = event => {
		this.setState({ [event.target.name] : event.target.value });
	};

	handleSubmit = event => {
		event.preventDefault();
		if(this.isFormValid(this.state)) {
			this.setState({ errors: [], loading: true });
			const { email, password } = this.state;
			firebase.auth().signInWithEmailAndPassword(email,password)
				.then(signedInUser => {
					this.setState({ errors: [], loading: false });
				})
				.catch(err => {
					this.setState({ errors: this.state.errors.concat(err), loading:false });
				});
		}
	}

	isFormValid = ({ email, password }) => email && password;

	handleInputError = (errors,inputName) => {
		return errors.some(error => error.message.toLowerCase().includes(inputName) || error.message.toLowerCase().includes('fields')) ? 'error' : ''
	}

	render() {
		const { email, password, errors, loading } = this.state;
		return (
			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h1" icon color="violet" textAlign="center">
						<Icon name="code branch" color="violet" />
						Login to DevChat
					</Header>
					<Form onSubmit={this.handleSubmit} size="large">
						<Segment stacked>
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
							<Button disabled={loading} className={ loading ? 'loading' : '' } color="violet" fluid size="large">
								Login
							</Button>
						</Segment>
					</Form>
					<Message>Don't have an account? <Link to="/register">Register</Link></Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Login;