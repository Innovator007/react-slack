import React, { Component } from 'react';
import { Segment, Accordion, Header, Icon, Image, List } from 'semantic-ui-react';

class MetaPanel extends Component {
	state = {
		activeIndex: 0,
		privateChannel: this.props.isPrivateChannel,
		channel: this.props.currentChannel
	}

	setActiveIndex = (event, titleProps) => {
		const { index } = titleProps;
		const { activeIndex } = this.state;
		const newIndex = activeIndex === index ? -1 : index;
		this.setState({ activeIndex: newIndex });
	}

	displayTopPosters = posts => (
		Object.entries(posts)
			.sort((a,b) => b[1] - a[1])
			.map(([key,val],i) => (
				<List.Item key={i}>
					<Image avatar src={val.avatar} />
					<List.Content>
						<List.Header as="a">
							{key}
						</List.Header>
						<List.Description>
							{ this.formatCount(val.count) }
						</List.Description>	
					</List.Content>
				</List.Item>
			))
			.slice(0,5)
	);

	formatCount = count => (count > 1 || count===0) ? `${count} posts` : `${count} post`; 

	render() {
		const { activeIndex, privateChannel, channel } = this.state;
		const { userPosts } = this.props;

		if(privateChannel) return null;
		return (
			<React.Fragment>
			<Segment loading={!channel}>
				<Segment>
				<Header as="h2">About # {channel && channel.name}</Header>
				</Segment>
				<Accordion styled attached="true">
					
					<Accordion.Title active={activeIndex === 0} onClick={this.setActiveIndex} index={0}>
						<Icon name="dropdown" />
						<Icon name="info" />
						Channel Details
					</Accordion.Title>
					<Accordion.Content active={activeIndex===0}>
						{ channel && channel.details }
					</Accordion.Content>

					<Accordion.Title active={activeIndex === 1} onClick={this.setActiveIndex} index={1}>
						<Icon name="dropdown" />
						<Icon name="user circle" />
						Top Posters
					</Accordion.Title>
					<Accordion.Content active={activeIndex===1}>
						<List>
							{ userPosts && this.displayTopPosters(userPosts) }
						</List>
					</Accordion.Content>
				</Accordion>
				<Segment>
					<Header as="h3">
						Created By
					</Header>
					<Header as="h3">
						<Image circular src={channel && channel.createdBy.avatar} />
						{ channel && channel.createdBy.name }
					</Header>
				</Segment>
			</Segment>
			</React.Fragment>
		);
	}
}

export default MetaPanel;
