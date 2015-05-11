Messages = new Mongo.Collection("messages");
Chats = new Mongo.Collection("chats");

if (Meteor.isClient) {
  Meteor.subscribe("messages");
  Meteor.subscribe("chats");

  Template.message.helpers({
    isAuthor: function () {
      return this.author === Meteor.userId();
    }
  });

  // Template.chats.helpers({
  //   selectedChat: function () {
  //     var chat = Chats.findOne(Session.get("selectedChat"));
  //     return chat && chat.name;
  //   }
  // });

  Template.body.helpers({
    messages: function () {
      return Messages.find({}, {sort: {createdAt: -1}});
    },

    chats: function () {
      return Chats.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-message": function (event) {
      var text = event.target.text.value;
      Meteor.call("addMessage", text);

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

  Template.message.events({
    "click .delete": function () {
      Meteor.call("deleteMessage", this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.publish("messages", function () {
      // check(chatId, String);
      return Messages.find();
    });
    Meteor.publish("chats", function() {
      return Chats.find();
    });
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

  addMessage: function (text) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Messages.insert({
      text: text,
      createdAt: new Date(),
      author: Meteor.userId(),
      username: Meteor.user().username || Meteor.user().profile.name
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
