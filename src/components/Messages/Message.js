import React from 'react';
import moment from 'moment';
import { Comment, Image, Popup } from 'semantic-ui-react';

const isOwnMessage = (message, user) => {
	return message.user.id === user.uid ? 'message__self' : '';
}

const isImage = (message) => {
	return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
}

const timefromnow = (timestamp) => moment(timestamp).fromNow();

const Message = ({ message, user }) => {
	return (
		<Comment>
			<Comment.Avatar src={message.user.avatar} />
			<Comment.Content className={isOwnMessage(message, user)}>
			<Popup trigger={<Comment.Author as="a">{ message.user.name }</Comment.Author> } header={message.user.name} content={ message.content } position="right center" />
				<Comment.Metadata>
					{ timefromnow(message.timestamp) }
				</Comment.Metadata>
				{ isImage(message) ? 
					<Image src={message.image} className="message__image" /> :   
					<Comment.Text>
						{ message.content }
					</Comment.Text>
				}
			</Comment.Content>
		</Comment>
	);
}

export default Message;