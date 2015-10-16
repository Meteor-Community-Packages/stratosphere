Meteor.methods({
    /**
     * Get a list of superusers
     * @param id
     * @returns {boolean}
     */
    "/stratosphere/addUser":function(username){
        //Little bit of security
       Meteor.users.insert({
           username:username,
           type:'stub',
           permissions:{canSynchronize:true,canPublish:true}
       });
    }
});