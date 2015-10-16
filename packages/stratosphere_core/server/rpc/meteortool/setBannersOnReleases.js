Meteor.methods({
    /**
     * setBannersOnReleases
     */
    setBannersOnReleases:function(track,banners){
        Stratosphere.utils.checkAccess('canPublish');
        //XXX
    }
});