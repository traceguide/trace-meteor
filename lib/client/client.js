var traceguide = Traceguide;

Meteor.startup(function() {
    // Instrument the code to capture spans and monitoring information
    var rollback = [];
    try {
        instrumentMeteorMethods(rollback, Meteor.default_connection._methodHandlers);
    } catch (e) {
        console.error('Instrumentation failed. Rolling back.');
        _.each(rollback, function(arr) {
            arr[0][arr[1]] = arr[2];
        });
    }
});

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

        var ret;
        try {
            ret = baseImp.apply(this, arguments);
        } finally {
            span.infof("Call to method '%s' with arguments '%j' returned '%j'", name, arguments, ret);
            span.end();
        }
        return ret;
    };
}
