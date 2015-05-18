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
    var user = Meteor.userId();
    Meteor.users.update({_id: user}, {$set: {'profile.selectedChat': chat_id}});
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
          <div className="name">{this.state.selectedName}</div>
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

var Chat = React.createClass({
  render: function() {
    var {name, ...rest } = this.props;
    return <div {...rest} className={cx("chat", rest.className)}>
      <span className="name">{name}</span>
    </div>;
  }
});

var Messagelist = ReactMeteor.createClass({
  templateName: "Messagelist",

  startMeteorSubscriptions: function() {
    Meteor.subscribe("messages");
  },

  getMeteorState: function() {
    var selectedChat = Chats.findOne(Session.get("selected_chat"));
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

var Message = React.createClass({
  render: function() {
    var {text, username, time, ...rest } = this.props;
    return <div {...rest} className={cx("message", rest.className)}>
      <h5 className="username">{username} - {time}</h5>
      <span className="text">{text}</span>
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

  Meteor.publish("messages", function () {
    //var user = Meteor.users.findOne(this.userId);
    //var selectedChat = user.profile.selectedChat;
    // return Messages.find({ chat: selectedChat });
    return Messages.find();
  });
}
