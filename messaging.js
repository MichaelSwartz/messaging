Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
  Template.body.helpers({
    messages: function () {
      return Messages.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-message": function (event) {
      var text = event.target.text.value;

      Messages.insert({
        text: text,
        createdAt: new Date(),
        author: Meteor.userId(),
        username: Meteor.user().username || Meteor.user().profile.name
      });

      event.target.text.value = "";

      return false;
    }
  });

  Template.message.events({
    // "click .toggle-read": function () {
    //   Messages.update(this._id, {$set: {read: ! this.read}});
    // },
    "click .delete": function () {
      Messages.remove(this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
