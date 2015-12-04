Package.describe({
  name: 'traceguide:traceguide-meteor',
  version: '0.1.3',
  // Brief, one-line summary of the package.
  summary: 'Trace operations across the client and server',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/traceguide/traceguide-meteor',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
    'api-javascript': '0.5.23',
    'event-loop-monitor' : '0.1.0',
})

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use([ 'session' ]);

  // Client only
  api.addFiles([
    'lib/client/client.js',
  ], 'client');

  // Server only
  api.addFiles([
    'lib/server/status_monitor.js',
    'lib/server/server.js',
  ], 'server');

  api.addFiles('traceguide-meteor.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('traceguide:traceguide-meteor');
  api.addFiles('traceguide-meteor.js');
});
