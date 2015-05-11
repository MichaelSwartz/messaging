Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
  Meteor.subscribe("messages");

  Template.message.helpers({
    isAuthor: function () {
      return this.author === Meteor.userId();
    }
  });

  Template.body.helpers({
    messages: function () {
      return Messages.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-message": function (event) {
      var text = event.target.text.value;

      Meteor.call("addMessage", text);

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

    // Meteor.publish('chats', function() {
    //     return Chats.find();
    // });
  });
}

Meteor.methods({
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
