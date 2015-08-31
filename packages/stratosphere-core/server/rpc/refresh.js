
/**
 * Methods - custom methods for browser client
 */
Meteor.methods({
    refresh:function(){
        Stratosphere.utils.checkAccess();
        var synchronizer = new Synchronizer();
        synchronizer.synchronize();
    }
});