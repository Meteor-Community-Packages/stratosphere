Accounts.onCreateUser(function(options,user){

    if(user.services && user.services["meteor-developer"] && user.services["meteor-developer"].username){
        user.username = user.services["meteor-developer"].username;
    }

    if(Meteor.settings.public.loginRequired){
        var currentUser = Meteor.users.findOne({username:user.username,type:'stub'},{fields:{permissions:1}});
        if(user.type !== 'stub'){
            if(!currentUser){
                //XXX: always allow until meteor-tool allows login before sync
                throw new Meteor.Error("User not allowed");
            }else{
                user.permissions = currentUser.permissions;
                Meteor.users.remove(currentUser._id);
            }
        }else{
            if(currentUser){
                throw new Meteor.Error("Duplicate user");
            }
        }
    }else{
        if(user.type === 'stub'){
            throw new Meteor.Error("You can not create stubs when loginRequired is set to false");
        }
    }

    if(!user.permissions){
        user.permissions = {canSynchronize:true};
    }

    return user;
});