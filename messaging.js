Messages = new Mongo.Collection("messages");

// Messages.allow({
//   remove: function (userId, message) {
//     return message.author === userId;
//   },
//   fetch: ['author']
// });

if (Meteor.isClient) {
  Meteor.subscribe("messages");
  // Meteor.subscribe("chats");

  // Template.chats.helpers({
  //   selectedChat: function () {
  //     var chat = Chats.findOne(Session.get("selectedChat"));
  //     return chat && chat.name;
  //   }
  // });

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
      return Messages.find({});
      // chatId: chatId});
    });
    //
    // Meteor.publish('chats', function() {
    //     return Chats.find();
    // });
  });
}

Meteor.methods({
  addMessage: function (text) {
    if (! currentUser) {
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
    console.log(message.author);
    console.log(Meteor.userId());
    if (message.author !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Messages.remove(messageId);
  }
});
