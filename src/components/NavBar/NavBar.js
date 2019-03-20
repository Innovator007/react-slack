import React, { Component } from 'react';
import firebase from 'firebase';
import { Button, Header, Icon, Segment } from 'semantic-ui-react';

class NavBar extends Component {
    handleSignOut = () => {
		firebase.auth().signOut().then()
    }
    render() {
        return (
            <Segment color="orange" className="mobilenav">
                <Header as="h2" style={{ margin: 0 }}>
                    <Icon name="code" />
                    <Header.Content>
                        DevChat
                    </Header.Content>
                </Header>
                <Button color="orange" onClick={this.handleSignOut}>Sign Out</Button>
            </Segment>
        );
    }
}

export default NavBar;