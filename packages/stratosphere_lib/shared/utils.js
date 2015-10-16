Stratosphere.utils.checkAccess = function checkAccess(permission,user){
    if(!Stratosphere.utils.hasAccess(permission,user)){
        throw new Meteor.Error("403","Forbidden");
    }
}

Stratosphere.utils.hasAccess = function hasAccess(permission,user){
    //XXX: hack until meteor-tool allows login before sync
    if(permission === 'canSynchronize'){return true;}

    if(!user){
        user = Meteor.user();
    }else{
        if(typeof user === "string"){
            user = Meteor.users.findOne(user,{fields:{permissions:1}});
        }
    }
    if(!permission){
        permission = 'superUser';
    }

    return !Meteor.settings.public.loginRequired || (user && (user.permissions.superUser || user.permissions[permission]));
}