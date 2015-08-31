Meteor.methods({
    /**
     * Unrecommend a version
     */
    unrecommendVersion:function(name,version){
        Stratosphere.utils.checkAccess();
        Stratosphere.utils.setRecommendationStatus(name,version,false);
    }
});