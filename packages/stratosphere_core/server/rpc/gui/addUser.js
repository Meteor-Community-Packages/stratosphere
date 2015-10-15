Meteor.methods({
    /**
     * Get a list of superusers
     * @param id
     * @returns {boolean}
     */
    addUser:function(id){
        //Little bit of security
        Stratosphere.utils.checkAccess(true);
        return Meteor.settings.superUsers;
    }
});