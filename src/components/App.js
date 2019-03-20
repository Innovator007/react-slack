import React from 'react';
import { Grid } from 'semantic-ui-react';
import './App.css';
import { connect } from 'react-redux';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import NavBar from './NavBar/NavBar';

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts, primaryColor, secondaryColor, sidepanel }) => (
	<Grid stackable className="app" style={{ backgroundColor: secondaryColor, margin: "0px" }}>
	    <Grid.Column width={4} only="computer">
	    	<ColorPanel
				key={currentUser && currentUser.name} 
				currentUser={currentUser} 
			/>
	    	<SidePanel 
				key={currentUser && currentUser.uid} 
				currentUser={currentUser} 
				primaryColor={primaryColor}
			/>
	    </Grid.Column>
			<Grid.Column only="mobile">
				<NavBar 
					currentUser={currentUser} 
					primaryColor={primaryColor}
				/>
			</Grid.Column>
	    <Grid.Column width={8}>
	    	<Messages key={currentChannel && currentChannel.id} 
				currentUser={currentUser} 
				currentChannel={currentChannel} 
				isPrivateChannel={isPrivateChannel}
			/>
	    </Grid.Column>
	    <Grid.Column width={4}>
	    	<MetaPanel 
			key={currentChannel && currentChannel.name}
			userPosts={userPosts} 
			currentChannel={currentChannel}
			isPrivateChannel={isPrivateChannel}
			currentUser={currentUser}
		/>
	    </Grid.Column>
    </Grid>
)

const mapStateToProps = state => {
	return { 
		currentUser: state.user.currentUser, 
		currentChannel: state.channel.currentChannel, 
		isPrivateChannel: state.channel.isPrivateChannel,
		userPosts: state.channel.userposts,
		primaryColor: state.colors.primaryColor,
		secondaryColor: state.colors.secondaryColor
	};
}

export default connect(mapStateToProps)(App);
