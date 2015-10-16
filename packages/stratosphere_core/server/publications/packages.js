
//FindFromPublication.publish('stratosphere/packages', function(options) {
Meteor.publish('/stratosphere/packages', function(options) {

    try{
        Stratosphere.utils.checkAccess('canSynchronize',this.userId);
        Stratosphere.schemas.publishOptions.clean(options);
        check(options, Stratosphere.schemas.publishOptions);

        Counts.publish(this, 'nbPackages', Packages.find({private:true}), {noReady:true});
        return Packages.find({private:true/*, hidden:false*/},options);
    }catch(e){
        return [];
    }

});