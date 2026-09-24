// Optional IP whitelisting: only whitelisted IPs/CIDR ranges can reach the server.
// Other IPs can be added at runtime by POSTing to /whitelist with the `apikey` header.
import { Meteor } from 'meteor/meteor';
import { RoutePolicy } from 'meteor/routepolicy';
import { WebApp } from 'meteor/webapp';
import { inRange } from 'range_check';
import { IpWhitelist } from './collections';

// First x-forwarded-for entry when behind a proxy, otherwise the socket address
const clientIp = req =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress?.replace(/^::ffff:/, '');

function allow(ipAddress) {
  const whitelist = Meteor.settings.ipWhitelist;
  if (!whitelist.includes(ipAddress)) {
    whitelist.push(ipAddress);
    console.log(`Added ip-address ${ipAddress} to whitelist`);
  }
}

export async function startWhitelisting() {
  if (!Meteor.settings.enableIpWhitelisting) {
    console.log('IP-whitelisting is disabled');
    return;
  }
  const { ipWhitelistAuthKey } = Meteor.settings;
  if (!ipWhitelistAuthKey || ipWhitelistAuthKey === 'CHANGE ME') {
    throw new Meteor.Error('In settings the ipWhitelistAuthKey needs to be changed');
  }
  Meteor.settings.ipWhitelist ??= [];

  console.log('Enable explicit whitelisting');
  // Also picks up IPs whitelisted on other server instances
  await IpWhitelist.find({}).observeAsync({ added: doc => doc.ipAddress && allow(doc.ipAddress) });

  WebApp.rawHandlers.use((req, res, next) => {
    const ip = clientIp(req);
    if (req.url === '/whitelist' || (ip && inRange(ip, Meteor.settings.ipWhitelist))) return next();
    console.log(`Access denied for ip-address ${ip}`);
    res.writeHead(404);
    res.end();
  });

  console.log('Start auth server');
  RoutePolicy.declare('/whitelist', 'network');
  WebApp.handlers.use('/whitelist', async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim();
    if (!req.headers.apikey || !ip) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
    } else if (req.headers.apikey !== ipWhitelistAuthKey) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
    } else {
      if (!(await IpWhitelist.findOneAsync({ ipAddress: ip }))) await IpWhitelist.insertAsync({ ipAddress: ip });
      allow(ip);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write(`ipAddress: ${ip}`);
    }
    res.end();
  });
}
