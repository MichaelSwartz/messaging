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
        <div className="none"><h3>Select a chat</h3></div>
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

var Messagelist = ReactMeteor.createClass({
  templateName: "Messagelist",

  startMeteorSubscriptions: function() {
    selectedChat = Session.get("selected_chat");
    Meteor.subscribe("messages", selectedChat);
  },

  getMeteorState: function() {
    return {
      messages: Messages.find({}, {sort: {createdAt: -1}}).fetch(),
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
  templateName: "Message",

  render: function() {
    var {text, username, time, ...rest } = this.props;
    return <div {...rest} className={cx("message", rest.className)}>
      <strong className="username">{username}</strong> - {time}
      <br />&nbsp;&nbsp;&nbsp;
      <span className="text">{text}</span>
    </div>;
  }
});

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Template.body.events({
    "submit .new-message": function (event) {
      var text = event.target.text.value;
      var chat = Session.get("selected_chat");

      Meteor.call("addMessage", text, chat);

      event.target.text.value = "";
      return false;
    },

    "submit .new-chat": function (event) {
      var name = event.target.text.value;
      Meteor.call("addChat", name);

      event.target.text.value = "";
      return false;
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("chats", function() {
    return Chats.find();
  });

  Meteor.publish("messages", function (chat) {
    return Messages.find({ chat: chat });
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

    if (!!text && !!chat) {
      Messages.insert({
        text: text,
        createdAt: new Date(),
        author: Meteor.userId(),
        username: Meteor.user().username || Meteor.user().profile.name,
        chat: chat
      });
    }
  },
});
