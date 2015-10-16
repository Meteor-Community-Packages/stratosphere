Meteor.users.deny({
    insert:function(){return true;},
    update:function(){return true;},
    remove:function(){return true;}
});
//Meteor.users.allow({
//    update: function (userId, doc, fields, modifier) {
//
//        if(!Meteor.settings.public.loginRequired){return false;}
//        if(!Stratosphere.utils.hasAccess('superUser')){return false;}
//
//        const userToModify = Meteor.users.findOne(doc._id,{fields:{'permissions.superUser':1}});
//        if(userToModify.permissions.superUser){
//            return false;
//        }
//
//        const permissions = ['canPublish','canUnpublish'];
//
//        if (_.without(fields, permissions).length > 0) {
//            return false;
//        }
//
//        const allowedModifier = {
//            $set: {}
//        };
//
//        for(let permission in permissions){
//            if(fields.indexOf(permission) !== -1){
//                allowedModifier.$set["permissions."+permission] = !!doc[permission];
//            }
//        }
//
//        return _.isEqual(modifier, allowedModifier);
//    }
//});