Meteor.methods({
    /**
     * Get a list of superusers
     * @param id
     * @returns {boolean}
     */
    "/stratosphere/removeUser":function(id){
        Stratosphere.utils.checkAccess('superUser');
        check(id,String);
        return Meteor.users.remove({_id:id,permission:{$ne:'superUser'}});
    }
});