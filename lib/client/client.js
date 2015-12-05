var traceguide = Traceguide;

Meteor.startup(function() {
    // Instrument the code to capture spans and monitoring information
    var rollback = [];
    try {
        instrumentMeteorCall(rollback);
        instrumentMeteorMethods(rollback, Meteor.default_connection._methodHandlers);
    } catch (e) {
        console.error('Instrumentation failed. Rolling back.');
        _.each(rollback, function(arr) {
            arr[0][arr[1]] = arr[2];
        });
    }
});

function instrumentMeteorCall(rollback) {
    var baseImp = Meteor.call;
    rollback.push(Meteor, 'call', baseImp);

    Meteor.call = function() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length < 1) {
            return baseImp.apply(this, args);;
        }

        var span = traceguide.span("meteor/call/" + args[0]);
        var userId = this.userId ? this.userId() : "unknown_user";
        span.endUserID(userId);

        // Either wrap or add an async callback to time the full operation
        // from client to server and back.
        if (!this.isSimulation) {
            var asyncSpan = false;
            var lastIndex = args.length - 1;
            if (lastIndex >= 0) {
                var lastArg = args[lastIndex];
                if (typeof lastArg === 'function') {
                    var callback = args[lastArg];
                    args[lastArg] = function() {
                        span.end();
                        return callback.apply(this, arguments);
                    };
                } else {
                    args.push(function(err) {
                        if (err) {
                            span.errorf("Error in method: %j", err);
                        }
                        span.end();
                    });
                }
                asyncSpan = true;
            }
        }

        // Make the call
        span.infof("Call with arguments '%j'", arguments);
        var ret;
        try {
            ret = baseImp.apply(this, args);;
        } finally {
            if (!asyncSpan) {
                span.end();
            }
        }
        return ret;
    };
}

function instrumentMeteorMethods(rollback, list) {
    _.each(_.keys(list), function (name) {
        wrapMeteorMethod(rollback, list, name, "meteor/methods");
    });
    traceguide.infof('Method instrumentation complete');
};

function wrapMeteorMethod(rollback, proto, name, prefix) {
    var baseImp = proto[name];
    rollback.push(proto, name, baseImp);

    if (!baseImp || typeof baseImp !== 'function') {
        throw new Error('Prototype does not have a function named:', name);
    }
    proto[name] = function() {
        var span = traceguide.span(prefix + "/" + name);
        var userId = this.userId || "unknown_user";
        span.endUserID(userId);
        span.infof("Call to method '%s' with arguments '%j'", name, arguments);
        var ret;
        try {
            ret = baseImp.apply(this, arguments);
        } finally {
            span.end();
        }
        return ret;
    };
}
