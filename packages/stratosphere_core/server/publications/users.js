Meteor.publish('stratosphere/users', function() {
    try{
        Stratosphere.utils.checkAccess(true);
        check(track,String);
        return Meteor.users.find({"services.meteor-developer.username" : {$nin:Meteor.settings.superUsers}},{fields:{"profile.name":1,"services.meteor-developer.username":1}});
    }catch(e){
        return [];
    }
});