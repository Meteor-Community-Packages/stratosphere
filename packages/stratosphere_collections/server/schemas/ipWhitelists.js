Stratosphere.schemas.IpWhitelistSchema = new SimpleSchema({
	ipAddress: {
		type: SimpleSchema.RegEx.IPv4
	}
});