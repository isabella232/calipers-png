'use strict';

var fs      = require('fs');
var Promise = require('bluebird');
var pread   = Promise.promisify(fs.read, { multiArgs: true });
var utils   = require('./utils');

exports.detect = function (buffer) {
  return utils.ascii(buffer, 1, 8) === 'PNG\r\n\x1a\n' && utils.ascii(buffer, 12, 16) === 'IHDR';
};

exports.measure = function (pathOrBuffer, fd) {
  return Promise.resolve()
  .then(function () {
    if (pathOrBuffer instanceof Buffer) {
      return [0, pathOrBuffer];
    } else {
      return pread(fd, new Buffer(24), 0, 24, 0);
    }
  })
  .spread(function (bytesRead, buffer) {
    return {
      type: 'png',
      pages: [{
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
      }]
    };
  });
};
