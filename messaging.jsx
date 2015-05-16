/**
 * @jsx React.DOM
 */

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
      chats: Chats.find({}).fetch(),
      selectedChat: selectedChat,
      selectedName: selectedChat && selectedChat.name
    };
  },

  selectChat: function(id) {
    Session.set("selected_chat", id);
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

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.publish("chats", function() {
    return Chats.find();
  });
}
