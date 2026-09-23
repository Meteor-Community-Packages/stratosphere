// Serves package files and receives uploads from meteor-tool (raw `PUT` with an upload token).
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Meteor } from 'meteor/meteor';
import { RoutePolicy } from 'meteor/routepolicy';
import { WebApp } from 'meteor/webapp';
import { UploadTokens } from './collections';

const mimeTypes = { '.tgz': 'application/x-gtar', '.md': 'text/x-markdown', '.txt': 'text/plain' };
const fileNames = { build: 'build.tgz', version: 'sources.tgz', readme: 'README.md' };

/** Resolves configured directories relative to the app root (in development) or the bundle root. */
function resolveDirectory(dir) {
  // cwd is <bundle>/programs/server, in development <app>/.meteor/local/build/programs/server
  const bundleRoot = path.resolve(process.cwd(), '../..');
  const appRoot = path.basename(path.resolve(bundleRoot, '../..')) === '.meteor' ? path.resolve(bundleRoot, '../../..') : bundleRoot;
  return path.resolve(appRoot, dir);
}

function send(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain' });
  res.end(message);
}

async function serveFile(req, res, uploadDir) {
  const filename = path.join(uploadDir, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!filename.startsWith(uploadDir + path.sep)) return send(res, 403, 'Access denied');

  const stats = await fs.promises.stat(filename).catch(() => null);
  if (!stats) return send(res, 404, '404 Not Found\n');
  if (!stats.isFile()) return send(res, 403, 'Access denied');

  res.writeHead(200, {
    'Content-Type': mimeTypes[path.extname(filename)] ?? 'application/octet-stream',
    'Content-Length': stats.size,
    'Cache-Control': 'public, max-age=86400',
  });
  if (req.method === 'HEAD') return res.end();
  await pipeline(fs.createReadStream(filename), res);
}

async function receiveFile(req, res, uploadDir) {
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  const tokenData = token && (await UploadTokens.findOneAsync({ _id: token, used: false }));
  if (!tokenData) return send(res, 403, 'Invalid upload token');

  const segments = [tokenData.packageId, 'versions', tokenData.versionId];
  if (tokenData.type === 'build') segments.push('builds', tokenData.buildId);
  const destination = path.join(uploadDir, ...segments, fileNames[tokenData.type]);

  // Write next to the destination first, so an aborted upload never leaves a partial file behind
  const partial = `${destination}.${token}.part`;
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  try {
    await pipeline(req, fs.createWriteStream(partial));
    await fs.promises.rename(partial, destination);
  } catch (e) {
    await fs.promises.rm(partial, { force: true });
    throw e;
  }

  await UploadTokens.updateAsync(tokenData._id, { $set: { used: true } });
  send(res, 200, '');
}

export function startUploadServer() {
  const { directories } = Meteor.settings;
  directories.uploads = resolveDirectory(directories.uploads);
  fs.mkdirSync(directories.uploads, { recursive: true });

  RoutePolicy.declare('/upload/', 'network');
  WebApp.handlers.use('/upload', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, HEAD, GET, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, x-amz-acl, Content-Range, Content-Disposition');
    try {
      switch (req.method) {
        case 'OPTIONS':
          return res.end();
        case 'GET':
        case 'HEAD':
          return await serveFile(req, res, directories.uploads);
        case 'PUT':
          return await receiveFile(req, res, directories.uploads);
        default:
          return send(res, 405, 'Method not allowed');
      }
    } catch (e) {
      console.error('Upload server error', e);
      if (!res.headersSent) send(res, 500, '500 Internal server error\n');
      else res.destroy();
    }
  });
  console.log(`Upload route mounted: /upload/ (files in ${directories.uploads})`);
}
