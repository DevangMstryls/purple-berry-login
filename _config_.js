"use strict";

const CONFIG = {};

CONFIG.name = 'Purple Berry Login';
CONFIG.siteUrl = '';
CONFIG.server = {};
CONFIG.server.host = '127.0.0.1';
CONFIG.server.port = 8000;
CONFIG.server.base = {};
CONFIG.server.base.dev = './www';
CONFIG.server.base.prod = './dist';

CONFIG.dirs = {};
CONFIG.dirs.src = {};

CONFIG.dirs.src.root = 'www';
CONFIG.dirs.src.assets = CONFIG.dirs.src.root + '/static/assets';

// assets
CONFIG.dirs.src.fonts = CONFIG.dirs.src.assets + '/fonts';
CONFIG.dirs.src.images = CONFIG.dirs.src.assets + '/images';
CONFIG.dirs.src.favicons = CONFIG.dirs.src.assets + '/favicons';
CONFIG.dirs.src.icons = CONFIG.dirs.src.assets + '/icons';

CONFIG.dirs.src.scss = CONFIG.dirs.src.root + '/static/src/scss';
CONFIG.dirs.src.css = CONFIG.dirs.src.root + '/static/compiled/css';
CONFIG.dirs.src.devJs = CONFIG.dirs.src.root + '/static/src/js';
CONFIG.dirs.src.js = CONFIG.dirs.src.root + '/static/compiled/js';

CONFIG.dirs.dest = {};
CONFIG.dirs.dest.root = 'dist';

for (var dir in CONFIG.dirs.src) {
  if (dir !== 'root') {
    var destinationDir = CONFIG.dirs.src[dir].replace(CONFIG.dirs.src.root, CONFIG.dirs.dest.root);

    // set destination dir path
    CONFIG.dirs.dest[dir] = destinationDir;
  }
}

module.exports = CONFIG;
