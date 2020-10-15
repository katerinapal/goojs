"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Easing_Bounce = {
    In: function In(k) {
        return 1 - Easing.Bounce.Out(1 - k);
    },

    Out: function Out(k) {
        if (k < 1 / 2.75) {
            return 7.5625 * k * k;
        } else if (k < 2 / 2.75) {
            return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
        } else if (k < 2.5 / 2.75) {
            return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
        } else {
            return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
        }
    },

    InOut: function InOut(k) {
        if (k < 0.5) {
            return Easing.Bounce.In(k * 2) * 0.5;
        }
        return Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
    }
};

var Easing_Back = {
    In: function In(k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    },

    Out: function Out(k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    },

    InOut: function InOut(k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
};

var Easing_Elastic = {
    In: function In(k) {
        var s;
        var a = 0.1;
        var p = 0.4;

        if (k === 0) {
            return 0;
        }

        if (k === 1) {
            return 1;
        }

        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p * Math.asin(1 / a) / (2 * Math.PI);
        }

        return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    },

    Out: function Out(k) {
        var s;
        var a = 0.1;
        var p = 0.4;

        if (k === 0) {
            return 0;
        }

        if (k === 1) {
            return 1;
        }

        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p * Math.asin(1 / a) / (2 * Math.PI);
        }

        return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
    },

    InOut: function InOut(k) {
        var s;
        var a = 0.1;
        var p = 0.4;

        if (k === 0) {
            return 0;
        }

        if (k === 1) {
            return 1;
        }

        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p * Math.asin(1 / a) / (2 * Math.PI);
        }

        if ((k *= 2) < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        }

        return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
    }
};

var Easing_Circular = {
    In: function In(k) {
        return 1 - Math.sqrt(1 - k * k);
    },

    Out: function Out(k) {
        return Math.sqrt(1 - --k * k);
    },

    InOut: function InOut(k) {
        if ((k *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }
};

var Easing_Exponential = {
    In: function In(k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    },

    Out: function Out(k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    },

    InOut: function InOut(k) {
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        if ((k *= 2) < 1) {
            return 0.5 * Math.pow(1024, k - 1);
        }
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    }
};

var Easing_Sinusoidal = {
    In: function In(k) {
        return 1 - Math.cos(k * Math.PI / 2);
    },

    Out: function Out(k) {
        return Math.sin(k * Math.PI / 2);
    },

    InOut: function InOut(k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }
};

var Easing_Quintic = {
    In: function In(k) {
        return k * k * k * k * k;
    },

    Out: function Out(k) {
        return --k * k * k * k * k + 1;
    },

    InOut: function InOut(k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
};

var Easing_Quartic = {
    In: function In(k) {
        return k * k * k * k;
    },

    Out: function Out(k) {
        return 1 - --k * k * k * k;
    },

    InOut: function InOut(k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k;
        }
        return -0.5 * ((k -= 2) * k * k * k - 2);
    }
};

var Easing_Cubic = {
    In: function In(k) {
        return k * k * k;
    },

    Out: function Out(k) {
        return --k * k * k + 1;
    },

    InOut: function InOut(k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k + 2);
    }
};

var Easing_Quadratic = {
    In: function In(k) {
        return k * k;
    },

    Out: function Out(k) {
        return k * (2 - k);
    },

    InOut: function InOut(k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    }
};

var Easing_Linear = {
    None: function None(k) {
        return k;
    },

    In: function In(k) {
        return k;
    },

    Out: function Out(k) {
        return k;
    },

    InOut: function InOut(k) {
        return k;
    }
};

exports.Linear = Easing_Linear;
exports.Quadratic = Easing_Quadratic;