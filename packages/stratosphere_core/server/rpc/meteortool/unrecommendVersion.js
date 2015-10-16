Meteor.methods({
    /**
     * Unrecommend a version
     */
    unrecommendVersion:function(name,version){
        Stratosphere.utils.checkAccess('canPublish');
        Stratosphere.utils.setRecommendationStatus(name,version,false);
    }
});