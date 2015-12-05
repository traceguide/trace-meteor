# traceguide-meteor

Provides automatic trace generator within the Meteor framework using the NPM module [api-javascript on NPM](https://www.npmjs.com/package/api-javascript).

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
