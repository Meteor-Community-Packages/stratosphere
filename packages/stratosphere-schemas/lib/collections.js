Packages = new Mongo.Collection("packages");
Versions = new Mongo.Collection("versions");
Builds = new Mongo.Collection("builds");
ReleaseTracks= new Mongo.Collection("releaseTracks");
ReleaseVersions = new Mongo.Collection("releaseVersions");
Metadata = new Mongo.Collection("metadata");
UploadTokens = new Mongo.Collection("uploadTokens");

///**
// * ASTRONOMY BEHAVIORS
// */
//Astro.createBehavior({
//    name: 'timestamp',
//    events: {
//        addbehavior: function(behaviorData) {
//            var Class = this;
//
//            // Add fields to the Class.
//            Class.addFields({
//                lastUpdated: {
//                    type: 'date',
//                    default: null
//                }
//            });
//
//            // Update the "createdAt" and "updatedAt" fields in proper events.
//            Class.addEvents({
//                beforeInsert: function() {
//                    this.lastUpdated= new Date();
//                },
//                beforeUpdate: function() {
//                    this.lastUpdated = new Date();
//                }
//            });
//        },
//        initclass: function(schemaDefinition) {},
//        initinstance: function(attrs) {}
//    }
//});
//
//
//
///**
// * ASTRONOMY Classes
// */
//
//
//Package = Astro.Class({
//    name: 'Package',
//    collection: Packages,
//    fields: {
//        'name':{
//            type: 'string'
//        },
//        'maintainers':{
//            type: 'array',
//            default: []
//        },
//        'maintainers.$':{
//            type: 'object',
//            default: {}
//        },
//        'maintainers.$.username':{
//          type: 'string'
//        },
//        'maintainers.$.id':{
//            type: 'string'
//        },
//        'homepage':{
//            type: 'string'
//        }
//    },
//    validators: {
//        'name':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'maintainers':[
//            Validators.required(),
//            Validators.array()
//        ],
//        'maintainers.$':[
//            Validators.object(),
//            Validators.has('username'),
//            Validators.has('id')
//        ],
//        'maintainers.$.username':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'maintainers.$.id':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'homepage':[
//            Validators.string()
//        ]
//    },
//    behaviors: ['timestamp'],
//    methods: {
//        publish: function() {
//            alert(this.title);
//        },
//        isPrivate: function(){
//            return this.private;
//        },
//        rename: function(newName){
//            this.name = newName;
//            this.save();
//            Versions.update({packageName:pack.name},{$set:{packageName:newName,lastUpdated:date}});
//        },
//        addMaintainer: function(user){
//            this.maintainers.push(user);
//        }
//    }
//});
//
//Build = Astro.Class({
//    name: 'Build',
//    collection: Builds,
//    fields: {
//        'versionId':{
//            type: 'string'
//        },
//        'buildArchitectures':{
//            type: 'string'
//        },
//        'builtBy':{
//            type: 'object',
//            default: {}
//        },
//        'builtBy.username':{
//            type: 'string'
//        },
//        'builtBy.id':{
//            type: 'string'
//        },
//        'build':{
//            type: 'object',
//            default: {}
//        },
//        'build.url':{
//            type: 'string'
//        },
//        'build.tarballHash':{
//            type: 'string'
//        },
//        'build.treeHash':{
//            type: 'string'
//        },
//        'buildPublished':{
//            type: 'date'
//        }
//    },
//    validators: {
//        'versionId':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'buildArchitectures':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'builtBy':[
//            Validators.object(),
//            Validators.has('username'),
//            Validators.has('id')
//        ],
//        'builtBy.username':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'builtBy.id':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'build.url':[
//            Validators.string()
//        ],
//        'build.tarballHash':[
//            Validators.string()
//        ],
//        'build.treeHash':[
//            Validators.string()
//        ],
//        'buildPublished':[
//            Validators.date()
//        ]
//    },
//    behaviors: ['timestamp'],
//    methods: {
//        publish: function() {
//            alert(this.title);
//        }
//    }
//});
//
//Version = Astro.Class({
//    name: 'Version',
//    collection: Versions,
//    fields: {
//        'packageName':{
//            type: 'string'
//        },
//        'version':{
//            type: 'string'
//        },
//        'earliestCompatibleVersion':{
//            type: 'string'
//        },
//        'containsPlugins':{
//            type: 'boolean'
//        },
//        'debugOnly':{
//            type: 'boolean'
//        },
//        'description':{
//            type: 'string'
//        },
//        'longDescription':{
//            type: 'string'
//        },
//        'publishedBy':{
//            type: 'object',
//            default: {}
//        },
//        'publishedBy.username':{
//            type: 'string'
//        },
//        'publishedBy.id':{
//            type: 'string'
//        },
//        'exports':{
//            type: 'array',
//            default: []
//        },
//        'exports.$':{
//            type: 'object'
//        },
//        'exports.$.architectures':{
//            type: 'string'
//        },
//        'exports.$.name':{
//            type: 'string'
//        },
//        'dependencies':{
//            type: 'array'
//        },
//        'dependencies.$':{
//            type: 'object'
//        },
//        'dependencies.$.packageName':{
//            type: 'string'
//        },
//        'dependencies.$.constraint':{
//            type: 'string',
//            default:null
//        },
//        'dependencies.$.references':{
//            type: 'array'
//        },
//        'dependencies.$.references.$':{
//            type: 'object'
//        },
//        'dependencies.$.references.$.arch':{
//            type: 'string'
//        },
//        'source':{
//            type: 'object'
//        },
//        'source.url':{
//            type: 'string'
//        },
//        'source.tarballHash':{
//            type: 'string'
//        },
//        'source.treeHash':{
//            type: 'string'
//        },
//        'readme':{
//            type: 'object'
//        },
//        'readme.url':{
//            type: 'string'
//        },
//        'readme.hash':{
//            type: 'string'
//        },
//        'git':{
//            type: 'string'
//        },
//        'releaseName':{
//            type: 'string'
//        },
//        'compilerVersion':{
//            type: 'string'
//        },
//        'ecRecordFormat':{
//            type: 'string'
//        },
//        'published':{
//            type: 'date'
//        }
//    },
//    validators: {
//        'packageName':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'version':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(3)
//        ],
//        'earliestCompatibleVersion':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'containsPlugins':[
//            Validators.required(),
//            Validators.boolean(),
//            Validators.required()
//        ],
//        'debugOnly':[
//            Validators.required(),
//            Validators.boolean(),
//            Validators.required()
//        ],
//        'description':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1),
//            Validators.maxLength(100)
//        ],
//        'longDescription':[
//            Validators.string(),
//            Validators.maxLength(1500)
//        ],
//        'publishedBy':[
//            Validators.object(),
//            Validators.has('username'),
//            Validators.has('id')
//        ],
//        'publishedBy.username':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'publishedBy.id':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'exports':[
//            Validators.array(),
//        ],
//        'exports.$':[
//            Validators.object(),
//            Validators.has('architectures'),
//            Validators.has('name')
//        ],
//        'exports.$.architectures':[
//            Validators.array(),
//            Validators.minLength(1)
//        ],
//        'exports.$.architectures.$':[
//            Validators.String()
//         ],
//        'exports.$.name':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'dependencies':[
//            Validators.array(),
//        ],
//        'dependencies.$':[
//            Validators.object(),
//            Validators.has('packageName'),
//            Validators.has('constraint')
//        ],
//        'dependencies.$.packageName':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'dependencies.$.constraint':[
//            Validators.string()
//        ],
//        'dependencies.$.references':[
//            Validators.array(),
//        ],
//        'dependencies.$.references.$':[
//            Validators.object(),
//            Validators.has('arch')
//        ],
//        'dependencies.$.references.$.arch':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'source':[
//            Validators.object(),
//            Validators.has('url'),
//            Validators.has('tarballHash'),
//            Validators.has('treeHash')
//        ],
//        'source.url':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'source.tarballHash':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'source.treeHash':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'readme':[
//            Validators.object(),
//            Validators.has('url'),
//            Validators.has('hash')
//        ],
//        'readme.url':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'readme.hash':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'git':[
//            Validators.string()
//        ],
//        'releaseName':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'compilerVersion':[
//            Validators.string(),
//            Validators.required(),
//            Validators.minLength(1)
//        ],
//        'ecRecordFormat':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'published':[
//            Validators.date(),
//            Validators.minLength(1)
//        ]
//    },
//    behaviors: ['timestamp'],
//    methods: {
//        publish: function() {
//            alert(this.title);
//        }
//    },
//     events: {
//         afterset: function(e) {
//             var fieldName = e.data.field;
//             var value = e.data.value;
//             if (fieldName === 'dependencies') {
//                 this.dependencies = _.toArrayFromObj(this.dependencies,'packageName')
//             }
//         }
//     }
//});
//
//ReleaseTrack = Astro.Class({
//    name: 'ReleaseTrack',
//    collection: ReleaseTracks,
//    fields: {
//        'name':{
//            type: 'string'
//        },
//        'maintainers':{
//            type: 'array',
//            default: []
//        },
//        'maintainers.$':{
//            type: 'object',
//            default: {}
//        },
//        'maintainers.$.username':{
//            type: 'string'
//        },
//        'maintainers.$.id':{
//            type: 'string'
//        }
//    },
//    validators: {
//        'name':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'maintainers':[
//            Validators.required(),
//            Validators.array()
//        ],
//        'maintainers.$':[
//            Validators.object(),
//            Validators.has('username'),
//            Validators.has('id')
//        ],
//        'maintainers.$.username':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'maintainers.$.id':[
//            Validators.string(),
//            Validators.minLength(1)
//        ]
//    },
//    behaviors: ['timestamp'],
//    methods: {
//        publish: function() {
//            alert(this.title);
//        }
//    }
//});
//
//ReleaseVersion = Astro.Class({
//    name: 'ReleaseVersion',
//    collection: ReleaseVersions,
//    fields: {
//        'track':{
//            type: 'string'
//        },
//        'version':{
//            type: 'string'
//        },
//        'tool':{
//            type: 'string'
//        },
//        'recommended':{
//            type: 'boolean',
//            default:false
//        },
//        'orderKey':{
//            type: 'string'
//        },
//        'description':{
//            type: 'string'
//        },
//        'packages':{
//            type: 'object',
//            default: {}
//        },
//        'banner':{
//            type: 'object'
//        },
//        'banner.text':{
//            type: 'string'
//        },
//        'banner.lastUpdated':{
//            type: 'date'
//        },
//        'publishedBy':{
//            type: 'object',
//            default: {}
//        },
//        'publishedBy.username':{
//            type: 'string'
//        },
//        'publishedBy.id':{
//            type: 'string'
//        }
//    },
//    validators: {
//        'track':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'version':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'tool':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'recommended':[
//            Validators.required(),
//            Validators.boolean()
//        ],
//        'description':[
//            Validators.string()
//        ],
//        'orderKey':[
//            Validators.required(),
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'banner':[
//            Validators.object()
//        ],
//        'banner.text':[
//            Validators.string()
//        ],
//        'banner.lastUpdated':[
//            Validators.date()
//        ],
//        'packages':[
//            Validators.object()
//        ],
//        'publishedBy':[
//            Validators.object(),
//            Validators.has('username'),
//            Validators.has('id')
//        ],
//        'publishedBy.username':[
//            Validators.string(),
//            Validators.minLength(1)
//        ],
//        'publishedBy.id':[
//            Validators.string(),
//            Validators.minLength(1)
//        ]
//    },
//    behaviors: ['timestamp'],
//    methods: {
//        publish: function() {
//            alert(this.title);
//        }
//    }
//});
