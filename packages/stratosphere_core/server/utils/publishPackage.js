/**
 * Set a package as published, this is after at least one version is published
 */
Stratosphere.utils.publishPackage = function publishPackage(name){
    const params = {name:name}
    Stratosphere.schemas.CreatePackageSchema.clean(params);
    check(params,Stratosphere.schemas.CreatePackageSchema);
    return Packages.upsert({name:params.name,private:true},{$set:{hidden:false, lastUpdated: new Date()}});
}