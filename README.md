# traceguide-meteor

Provides automatic distributed tracing performance and error data with the Meteor framework, using the NPM module [api-javascript on NPM](https://www.npmjs.com/package/api-javascript).

![Screenshot](http://resonancelabs.github.io/traceguide/static/images/meteor-example-trace-20151205.png)

## Usage

Install the package:

```
meteor add traceguide:traceguide-meteor
```

Set your access token and group name for the client and server:

```
Traceguide.initialize({
    access_token : "{your_access_token}",
});

if (Meteor.isServer) {
  Traceguide.options({ group_name: "my-app/server" });

  // your usual code here
}

if (Meteor.isClient) {
  Traceguide.options({ group_name: "my-app/client" });

  // your usual code here
}
```
