
/**
 * Methods - custom methods for browser client
 */
Meteor.methods({
    refresh:function(){
        Stratosphere.utils.checkAccess();
        const synchronizer = new Synchronizer();
        synchronizer.synchronize();
    }
});