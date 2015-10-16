Meteor.methods({
    /**
     * Modify user permission
     * @param id
     * @returns {boolean}
     */
    "/stratosphere/setUserPermission":function(id,permission,value){
        Stratosphere.utils.checkAccess('superUser');
        check(id,String);
        if(['canPublish','canUnpublish'].indexOf(permission) === -1){
            throw new Meteor.Error("Invalid permission");
        }

        const modifier = {$set:{}};
        modifier.$set["permissions."+permission] = !!value;
        return Meteor.users.update({_id:id,permission:{$ne:'superUser'}},modifier);
    }
});