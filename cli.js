#! /usr/bin/env node

const lib = require('./lib');
const wallpaper = require('wallpaper');
const help = require('./lib/help');
const output = require('./lib/output');
const version = require('./package.json').version;
const reporter = require('./lib/progress-reporter');
const argv = require('minimist')(process.argv.slice(2), {
    boolean: ['help', 'save-config', 'grayscale', 'blur', 'version'],
    alias: {
        w: 'width',
        h: 'height',
        d: 'dir',
        s: 'save-config',
        i: 'image',
        x: 'gravity',
        g: 'grayscale',
        b: 'blur',
        v: 'version',
        r: 'random',
        l: 'latest'
    }
});

// --help
if (argv.help) {
    console.log('\x1b[36m%s\x1b[0m',help);
}

// --version
if (argv.version) {
    console.log('version', version);
}

const options = lib.sanitizeArgs(argv);
const shouldSave = options['save-config'];
const shouldDownload = (options.latest || options.random || Boolean(options.image));

if (shouldSave || shouldDownload) {
    const promise = lib.readConfig(options);

    if (shouldSave) {
        promise.then(opts => lib.saveConfig(opts));
    }

    if (shouldDownload) {
        promise.then(opts => {
            const url = lib.createUrl(opts);

            console.log('request ', url);

            return lib.download(opts, url, reporter)
                .then(filename => {
                    console.log('Image saved to ', filename);
                    return wallpaper.set(filename);
                })
                .then(() => {
                    console.log('\x1b[5m%s\x1b[35m',output);
                });
        });
    }

    promise.catch(console.log);
} else {
    console.log(help);
}
