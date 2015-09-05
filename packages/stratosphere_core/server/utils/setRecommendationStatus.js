Stratosphere.schemas.RecommendVersionSchema = new SimpleSchema([Stratosphere.schemas.ReleaseVersionSchema.pick(['track','recommended','version'])]);

Stratosphere.utils.setRecommendationStatus = function setRecommendationStatus(name,version,recommended){
    const params = {
        track: name,
        version: version,
        recommended: recommended
    }
    Stratosphere.schemas.RecommendVersionSchema.clean(params);
    check(params,Stratosphere.schemas.RecommendVersionSchema);
    console.log('Changing release version recommendation state');
    if(!ReleaseVersions.update({track:params.track,version:params.version,private:true},{$set:{recommended:params.recommended,lastUpdated:new Date()}})){
        throw new Meteor.Error('404', 'Private release version not found');
    }
}