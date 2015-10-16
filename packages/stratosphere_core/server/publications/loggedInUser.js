Meteor.publish('/stratosphere/loggedInUser', function() {
    try{
        return Meteor.users.find(this.userId,{fields:{"type":1,"permissions":1}});
    }catch(e){
        return [];
    }
});