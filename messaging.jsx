var cx = React.addons.classSet;

Messages = new Meteor.Collection("messages");
Chats = new Meteor.Collection("chats");

var Chatlist = ReactMeteor.createClass({
  templateName: "Chatlist",

  startMeteorSubscriptions: function() {
    Meteor.subscribe("chats");
  },

  getMeteorState: function() {
    var selectedChat = Chats.findOne(Session.get("selected_chat"));
    return {
      chats: Chats.find({}, {sort: {name: 1}}).fetch(),
      selectedChat: selectedChat,
      selectedName: selectedChat && selectedChat.name
    };
  },

  selectChat: function(chat_id) {
    Session.set("selected_chat", chat_id);
  },

  renderChat: function(model) {
    var _id = this.state.selectedChat && this.state.selectedChat._id;

    return <Chat
      key={model._id}
      name={model.name}
      className={model._id === _id ? "selected" : ""}
      onClick={this.selectChat.bind(this, model._id)}
    />;
  },

  render: function() {
    var children = [
      <div className="chatlist">
        { this.state.chats.map(this.renderChat) }
      </div>
    ];

    if (this.state.selectedChat) {
      children.push(
        <div className="info">
          <div className="name"><h3>{this.state.selectedName}</h3></div>
        </div>
      );
    } else {
      children.push(
        <div className="none">Select a chat</div>
      );
    }

    return <div className="inner">{ children }</div>
  }
});

var Chat = ReactMeteor.createClass({
  render: function() {
    var {name, ...rest } = this.props;
    return <div {...rest} className={cx("chat", rest.className)}>
      <span className="name">{name}</span>
    </div>;
  }
});

var Messageform = ReactMeteor.createClass({
  templateName: "Messageform",

  addMessage: function(event) {
    event.preventDefault();

    // var text = React.findDOMNode(this.refs.text).value.trim();
    var text = event.target.text.value;
    var chat = Session.get("selectedChat");

    if (!text || !chat) {
      return;
      React.findDOMNode(this.refs.text).value = 'Nope';
    }

    Meteor.call("addMessage", text, chat);

    React.findDOMNode(this.refs.text).value = '';
    return;
  },

  render: function() {
    var selectedChat = Chats.findOne(Session.get("selected_chat"));

    return <form className="newMessage" onSubmit={this.addMessage}>
      <input type="text" name="text" placeholder="Write messages here!" />
      <input type="submit" value="Send" />
    </form>;

    //return <form className="form new-message" onSubmit={addMessage(text, selectedChat)}>
    //  <input type="text" name="text" placeholder="Write messages here!" />
    //</form>;
  }
})

var Messagelist = ReactMeteor.createClass({
  templateName: "Messagelist",

  startMeteorSubscriptions: function() {
    selectedChat = Session.get("selected_chat");
    Meteor.subscribe("messages", selectedChat);
  },

  getMeteorState: function() {
    return {
      messages: Messages.find({}, {sort: {createdAt: 1}}).fetch(),
    };
  },

  renderMessage: function(model) {
    return <Message
      key={model._id}
      text={model.text}
      username={model.username}
      time={moment(model.createdAt).fromNow()}
    />;
  },

  render: function() {
    var children = [
      <div className="messagelist">
        { this.state.messages.map(this.renderMessage) }
      </div>
    ];

    return <div className="inner">{ children }</div>
  }
});

var Message = ReactMeteor.createClass({

  deleteMessage: function(event) {
    event.preventDefault();

    Meteor.call("deleteMessage", this._id);
  },

  render: function() {
    var {text, username, time, ...rest } = this.props;
    return <div {...rest} className={cx("message", rest.className)}>
      <h5 className="username">{username} - {time}</h5>
      <span className="text">{text}</span>
      <button class="delete">&times;</button>
    </div>;
  }
});

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.publish("chats", function() {
    return Chats.find();
  });

  Meteor.publish("messages", function (chat) {
    return Messages.find({ chat: chat });
    // return Messages.find();
  });
}

Meteor.methods({
  addChat: function (name) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Chats.insert({
      name: name,
      createdAt: new Date (),
      owner: Meteor.userId(),
    });
  },

  addMessage: function (text, chat) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Messages.insert({
      text: text,
      createdAt: new Date(),
      author: Meteor.userId(),
      username: Meteor.user().username || Meteor.user().profile.name,
      chat: chat
    });
  },

  deleteMessage: function (messageId) {
    var message = Messages.findOne(messageId);
    if (message.author !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Messages.remove(messageId);
  }
});
