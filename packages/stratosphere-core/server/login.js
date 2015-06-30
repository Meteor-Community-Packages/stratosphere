///
/// LOGIN
///
var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length > 0;
});


// Handler to login from meteor-tool
/*Accounts.registerLoginHandler("tool", function (options) {
  if (! options.meteorAccountsLoginInfo)
    return undefined; // don't handle

  check(options.meteorAccountsLoginInfo, {
    username: NonEmptyString,
    password: NonEmptyString
  });

  var user = Meteor.users.findOne(options.meteorAccountsLoginInfo.username);

  if (!user)
    throw new Meteor.Error(403, "User not found");

  if (!user.services || !user.services.password || !user.services.password.bcrypt)
    throw new Meteor.Error(403, "User has no password set");

  return Accounts._checkPassword(
    user,
    options.meteorAccountsLoginInfo.password
  );
});*/