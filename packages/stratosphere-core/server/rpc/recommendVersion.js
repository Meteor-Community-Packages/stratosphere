
Meteor.methods({
    /**
     * Recommend a version
     */
    recommendVersion:function(name,version){
        Stratosphere.utils.checkAccess();
        Stratosphere.utils.setRecommendationStatus(name,version,true);
    }
});