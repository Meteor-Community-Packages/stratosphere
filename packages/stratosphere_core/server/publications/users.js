Meteor.publish('/stratosphere/users', function() {
    try{
        Stratosphere.utils.checkAccess('superUser',this.userId);
        return Meteor.users.find({},{fields:{"username":1,"type":1,"permissions":1}});
    }catch(e){
        return [];
    }
});