Meteor.methods({
    /**
     * Get a list of superusers
     * @param id
     * @returns {boolean}
     */
    "/stratosphere/addUser":function(username){
        //Little bit of security
        Stratosphere.utils.checkAccess('superUser');
        check(username,String);
        Stratosphere.utils.createUserStub(username,{canSynchronize:true,canPublish:true});
    }
});