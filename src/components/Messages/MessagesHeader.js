import React, { Component } from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends Component {
	render() {
		const { channelName, users, handleSearchChange, 
			searchLoading, isPrivateChannel, isChannelStarred, handleStar } = this.props;
		return (
			<Segment clearing>
				<Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
					<span>
						{ channelName }
						{!isPrivateChannel && <Icon style={{cursor:'pointer'}} onClick={handleStar} name={isChannelStarred ? 'star' : 'star outline'} color={isChannelStarred ? "yellow":"black"} /> }
					</span>
					<Header.Subheader>{users}</Header.Subheader>
				</Header>
				<Header floated="right">
					<Input loading={searchLoading} size="mini" onChange={handleSearchChange} icon="search" name="searchTerm" placeholder="Search Messages..." />
				</Header>
			</Segment>
		);
	}
}

export default MessagesHeader;