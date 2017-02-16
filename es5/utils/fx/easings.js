(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.easings = mod.exports;
    }
})(this, function () {
    'use strict';

    var rb = window.rb;

    [['ease-in-', ['quad', '0.55, 0.085, 0.68, 0.53'], ['cubic', '0.55, 0.055, 0.675, 0.19'], ['quart', '0.895, 0.030, 0.685, 0.22'], ['qunit', '0.755, 0.05, 0.855, 0.06'], ['sine', '0.47, 0, 0.745, 0.715'], ['expo', '0.95, 0.05, 0.795, 0.035'], ['circ', '0.6, 0.04, 0.98, 0.335'], ['back', '0.6, -0.28, 0.735, 0.045']], ['ease-out-', ['quad', '0.25, 0.46, 0.45, 0.94'], ['cubic', '0.215, 0.610, 0.355, 1.000'], ['quart', '0.165, 0.840, 0.440, 1.000'], ['qunit', '0.230, 1.000, 0.320, 1.000'], ['sine', '0.390, 0.575, 0.565, 1.000'], ['expo', '0.190, 1.000, 0.220, 1.000'], ['circ', '0.075, 0.820, 0.165, 1.000'], ['back', '0.175, 0.885, 0.320, 1.275']], ['ease-in-out-', ['quad', '0.455, 0.030, 0.515, 0.955'], ['cubic', '0.645, 0.045, 0.355, 1.000'], ['quart', '0.770, 0.000, 0.175, 1.000'], ['qunit', '0.860, 0.000, 0.070, 1.000'], ['sine', '0.445, 0.050, 0.550, 0.950'], ['expo', '1.000, 0.000, 0.000, 1.000'], ['circ', '0.785, 0.135, 0.150, 0.860'], ['back', '0.680, -0.550, 0.265, 1.550']]].forEach(function (group) {
        group[1].forEach(function (easing) {
            rb.addEasing(group + easing[1], easing[0]);
        });
    });
});
