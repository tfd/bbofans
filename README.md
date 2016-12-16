bbofans
=======

Website for a bridge club.

This app features a complete backend using node.js with ExpressJS, a data layer using MongoDB with Mongoose, and a complete front-end application built using Backbone.js (with Marionette and Browserify).  The front-end application is a simple club page with list of members together with their scores. A registration form completes the site. The administative front-end is more complex as it permits to manage the players and update tournamente results.

Based on "Anatomy of a web application using node.js, expressjs, mongodb & backbone.js" by Jason Krol:  http://kroltech.com/2013/12/boilerplate-web-app-using-backbone-js-expressjs-node-js-mongodb.

 * Backbone.js
  * Marionette
  * Browserify
  * Handlebars
  * Basic UI app
 * Express / Node.js
  * Handlebars
  * Mocha test runner
  * Chai, Sinon, Proxyquire tests
 * MongoDB
  * Mongoose
 * Bower
 * Grunt:

## Requirements

node 0.10+ (and npm), mongodb - visit nodejs.org and mongodb.com to download
each.

    $ sudo npm install -g grunt-cli
    $ npm install
    $ grunt init:dev

Grunt init:dev only needs to be run the first time to prepare the vendor.js
files.

## Directory layout

 build   - where javascript and less files are concatenated and minified.
 client  - the client side javascript, html and css (bootstrap, backbone+marionette, handlebars).
 install - some install scripts to prepare a raw server.
 public  - static files for the website. Final javascript and css files are also copied here after the build-
 server  - the server side javascript (nodejs)
 
## Running the App:

Start the server in DEV mode, with nodemon watching the app for a relaunch,
watchers on scripts and less files for rebuild.

    $ grunt server:dev

Note: Windows users, for some reason the grunt shell task will not launch
mongod during runtime (so the node server will crash). Be sure to launch
mongod in another window before starting grunt server.

### Front-end Tests/TDD:

Requires PhantomJS to be installed globally:

    $ sudo npm install -g phantomjs

To run tests in TDD watch mode:

    $ grunt tdd

To run tests once:

    $ grunt test:client

### Server Tests:

Server tests have been added using Mocha, Chai, and Proxyquire.  To run the
tests:

    $ grunt test:server

Note:

    $ grunt test

will run all tests - both server and client

## Layout:

### Homepage:

```
+-------------+
| navbar      |
+-------------+
+---------++--+
| info    ||td|
|         |+--+
|         |+--+
|         ||wb|
+---------++--+
```

### Admin

```
+-------------+
| navbar      |
+-------------+
+--++---------+
|m || info    |
|  ||         |
+--+|         |
    |         |
    +---------+
```

## Structure:

We have to modules:

* homepage - displays the homepage and related info, handles the login
* admin - displays the console after the user login, this module won't start if the user isn't logged in.

The admin has three sub-modules:

* member management
* blacklist management
* td management

### Regions:

I need to device a natural way to bing the various modules to a single region so I can change layout without having to
restructure all modules. The problem is the following:

If the user goes to the url #members/edit/<id> the following should happen:

1. start module 'admin.members'
2. start module 'admin'
3. draw admin layout
4. draw member/edit layout
5. bind the form
6. wait for user action

When the user then clicks on the blacklist manager link the following should happen:

1. stop module 'admin.edit'
2. remove member/edit layout
3. start module 'admin.blacklist'
4. draw blacklist/list layout
5. bind the view
6. wait for user action

How to structure the application so this sequence can be automated? At which point can I pass the correct region to the
various modules? I can't do  it in the start event of the module because they are executed in inverse order which means
that when the 'admin.members' module is started the region isn't yet there. So on the start of a module I can load it's
controllers but not yet give the region.

After the modules are started I have everything in place to draw the layout so I should probably trigger a show, but on
which module? At the start I made every controller bind to a global event like 'admin:members:edit:show' which would
show it's view. But in this scenario this isn't possible because the admin module hasn't rendered yet to there's now
place to show the view.

I need to activate the correct controller and show all needed views. The path '[admin:members]edit.show' should have
all the info needed so I could simply parse it and call admin.draw('[members]edit.show', region) which in turn calls
members.draw('edit.show', region), and so on. In this way every module knows only about itself and it's sub-modules and
orders the correct sub-module to draw itself in the correct region.

Ideally a module should have a structure like this:

```javascript
module(parents + '.moduleName', {
  startWithParent: false,

  define: function (module, app, Backbone, Marionette, _, $) {
    // Some housekeeping stuff, don't know really what
    this.app = app;
    this.moduleName = parents + '.moduleName';
  },

  onStart; function () {
    // start controllers. (this will NOT render the views)
    this.firstTime = true;
  }

  onStop: function () {
    // stop controllers. (this WILL remove the views)
  }

  draw: function (path, region) {
    if (this.firstTime) {
        // draw basic layout only the first time
        this.firstTime = false;
    }
    if (path.hasModule) {
        this.app.module(path.getNextModule()).draw(path, region);
    }
    else {
        this.controllers[path.getControllerName()][path.getMethodName()]();
    }
  }
}
```


