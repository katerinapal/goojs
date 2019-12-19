Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.keyForCode = exports.fillDefaultNames = exports.fillDefaultValues = exports.PROPERTY_TYPES = exports.TYPE_VALIDATORS = exports.isRefType = exports.DEFAULTS_BY_TYPE = undefined;

var _ObjectUtils = require("../util/ObjectUtils");

var ObjectUtils = _interopRequireWildcard(_ObjectUtils);

function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};if (obj != null) {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
        }newObj.default = obj;return newObj;
    }
}

var functionObject_keyForCode;
var functionObject__keyInverse;
var functionObject__keys;
var functionObject_getKey;
var functionObject_fillDefaultNames;
var functionObject_fillDefaultValues;
var functionObject_PROPERTY_TYPES;
var functionObject_PARAMETER_CONTROLS;
var functionObject_PARAMETER_TYPES;
var functionObject_TYPE_VALIDATORS;
var functionObject_isRefType;
var functionObject_REF_TYPES;
var functionObject_DEFAULTS_BY_TYPE;

function ScriptUtils() {}

exports.DEFAULTS_BY_TYPE = functionObject_DEFAULTS_BY_TYPE = {
    "array": [],
    "float": 0,
    "int": 0,
    "string": "",
    "vec2": [0, 0],
    "vec3": [0, 0, 0],
    "vec4": [0, 0, 0, 0],
    "boolean": false,
    "animation": null,
    "camera": null,
    "entity": null,
    "image": null,
    "sound": null,
    "texture": null,
    "json": null,
    "text": null
};

functionObject_REF_TYPES = ["animation", "camera", "entity", "image", "sound", "texture", "json", "text"];

exports.isRefType = functionObject_isRefType = function functionObject_isRefType(type) {
    return ObjectUtils.contains(functionObject_REF_TYPES, type);
};

exports.TYPE_VALIDATORS = functionObject_TYPE_VALIDATORS = function () {
    var isVec = function isVec(length) {
        return function (data) {
            return Array.isArray(data) && data.length === length;
        };
    };

    var isRef = function isRef(type) {
        function isDirectRef(data) {
            return ObjectUtils.isString(data) && ObjectUtils.getExtension(data) === type;
        }

        // Checks for references passed like:
        // {
        //     entityRef: string
        //     enabled: boolean
        // }
        function isWrappedRef(data) {
            return data && isDirectRef(data[type + "Ref"]);
        }

        return function (data) {
            return isDirectRef(data) || isWrappedRef(data);
        };
    };

    return {
        "array": ObjectUtils.isArray,
        "float": ObjectUtils.isNumber,
        "number": ObjectUtils.isNumber,
        "string": ObjectUtils.isString,
        "boolean": ObjectUtils.isBoolean,
        "int": ObjectUtils.isInteger,
        "vec2": isVec(2),
        "vec3": isVec(3),
        "vec4": isVec(4),
        "animation": isRef("animation"),
        "camera": isRef("camera"),
        "entity": isRef("entity"),
        "image": isRef("image"),
        "sound": isRef("sound"),
        "texture": isRef("texture"),
        "json": isRef("json"),
        "text": isRef("text")
    };
}();

functionObject_PARAMETER_TYPES = ["string", "int", "float", "vec2", "vec3", "vec4", "boolean", "texture", "sound", "camera", "entity", "animation", "json", "text"];

functionObject_PARAMETER_CONTROLS = function () {
    var typeControls = {
        "string": ["key"],
        "int": ["spinner", "slider", "jointSelector"],
        "float": ["spinner", "slider"],
        "vec2": [],
        "vec3": ["color"],
        "vec4": ["color"],
        "boolean": ["checkbox"],
        "texture": [],
        "sound": [],
        "camera": [],
        "entity": [],
        "animation": [],
        "json": [],
        "text": []
    };

    // Add the controls that can be used with any type to the mapping of
    // controls that ca be used for each type.
    for (var type in typeControls) {
        Array.prototype.push.apply(typeControls[type], ["dropdown", "select"]);
    }

    return typeControls;
}();

exports.PROPERTY_TYPES = functionObject_PROPERTY_TYPES = [{
    prop: "key",
    type: "string",
    mustBeDefined: true,
    minLength: 1
}, {
    prop: "type",
    type: "string",
    mustBeDefined: true,
    minLength: 1,

    getAllowedValues: function getAllowedValues() {
        return functionObject_PARAMETER_TYPES;
    }
}, {
    prop: "control",
    type: "string",

    getAllowedValues: function getAllowedValues(parameter) {
        // Allowed controls depend on the parameter type.
        return functionObject_PARAMETER_CONTROLS[parameter.type];
    }
}, {
    prop: "name",
    type: "string"
}, {
    prop: "min",
    type: "number"
}, {
    prop: "max",
    type: "number"
}, {
    prop: "scale",
    type: "number"
}, {
    prop: "decimals",
    type: "number"
}, {
    prop: "precision",
    type: "number"
}, {
    prop: "exponential",
    type: "boolean"
}];

exports.fillDefaultValues = functionObject_fillDefaultValues = function functionObject_fillDefaultValues(parameters, specs) {
    if (!(specs instanceof Array)) {
        return;
    }

    var keys = [];
    specs.forEach(function (spec) {
        if (!spec || typeof spec.key !== "string") {
            return;
        }

        if (spec.default === null || spec.default === undefined) {
            spec.default = ObjectUtils.deepClone(functionObject_DEFAULTS_BY_TYPE[spec.type]);
        }

        keys.push(spec.key);
        if (typeof parameters[spec.key] === "undefined") {
            parameters[spec.key] = ObjectUtils.clone(spec.default);
        }
    });

    //! AT: when does this ever happen?
    for (var key in parameters) {
        if (keys.indexOf(key) === -1 && key !== "enabled") {
            delete parameters[key];
        }
    }
};

exports.fillDefaultNames = functionObject_fillDefaultNames = function functionObject_fillDefaultNames(specs) {
    if (!(specs instanceof Array)) {
        return;
    }

    function getNameFromKey(key) {
        if (typeof key !== "string" || key.length === 0) {
            return "";
        }
        var capitalisedKey = key[0].toUpperCase() + key.slice(1);
        return capitalisedKey.replace(/(.)([A-Z])/g, "$1 $2");
    }

    specs.forEach(function (spec) {
        if (!spec) {
            return;
        }
        if (typeof spec.name === "undefined") {
            spec.name = getNameFromKey(spec.key);
        }
    });
};

functionObject_getKey = function functionObject_getKey(str) {
    if (functionObject__keys[str]) {
        return functionObject__keys[str];
    } else {
        return str.charCodeAt(0);
    }
};

functionObject__keys = {
    "Backspace": 8,
    "Tab": 9,
    "Enter": 13,
    "Shift": 16,
    "Ctrl": 17,
    "Alt": 18,
    "Meta": 91,
    "Pause": 19,
    "Capslock": 20,
    "Esc": 27,
    "Space": 32,
    "Pageup": 33,
    "Pagedown": 34,
    "End": 35,
    "Home": 36,
    "Leftarrow": 37,
    "Uparrow": 38,
    "Rightarrow": 39,
    "Downarrow": 40,
    "Insert": 45,
    "Delete": 46,
    "0": 48,
    "1": 49,
    "2": 50,
    "3": 51,
    "4": 52,
    "5": 53,
    "6": 54,
    "7": 55,
    "8": 56,
    "9": 57,
    "a": 65,
    "b": 66,
    "c": 67,
    "d": 68,
    "e": 69,
    "f": 70,
    "g": 71,
    "h": 72,
    "i": 73,
    "j": 74,
    "k": 75,
    "l": 76,
    "m": 77,
    "n": 78,
    "o": 79,
    "p": 80,
    "q": 81,
    "r": 82,
    "s": 83,
    "t": 84,
    "u": 85,
    "v": 86,
    "w": 87,
    "x": 88,
    "y": 89,
    "z": 90,
    "A": 65,
    "B": 66,
    "C": 67,
    "D": 68,
    "E": 69,
    "F": 70,
    "G": 71,
    "H": 72,
    "I": 73,
    "J": 74,
    "K": 75,
    "L": 76,
    "M": 77,
    "N": 78,
    "O": 79,
    "P": 80,
    "Q": 81,
    "R": 82,
    "S": 83,
    "T": 84,
    "U": 85,
    "V": 86,
    "W": 87,
    "X": 88,
    "Y": 89,
    "Z": 90,
    "0numpad": 96,
    "1numpad": 97,
    "2numpad": 98,
    "3numpad": 99,
    "4numpad": 100,
    "5numpad": 101,
    "6numpad": 102,
    "7numpad": 103,
    "8numpad": 104,
    "9numpad": 105,
    "Multiply": 106,
    "Plus": 107,
    "Minus": 109,
    "Dot": 110,
    "Slash1": 111,
    "F1": 112,
    "F2": 113,
    "F3": 114,
    "F4": 115,
    "F5": 116,
    "F6": 117,
    "F7": 118,
    "F8": 119,
    "F9": 120,
    "F10": 121,
    "F11": 122,
    "F12": 123,
    "Equals": 187,
    "Comma": 188,
    "Slash": 191,
    "Backslash": 220
};

functionObject__keyInverse = function (assoc) {
    var inverseAssoc = {};

    var keys = Object.keys(assoc);
    for (var i = 0; i < keys.length; i++) {
        inverseAssoc[assoc[keys[i]]] = keys[i];
    }
    return inverseAssoc;
}(functionObject__keys);

exports.keyForCode = functionObject_keyForCode = function functionObject_keyForCode(code) {
    return functionObject__keyInverse[code];
};

exports.DEFAULTS_BY_TYPE = functionObject_DEFAULTS_BY_TYPE;
exports.isRefType = functionObject_isRefType;
exports.TYPE_VALIDATORS = functionObject_TYPE_VALIDATORS;
exports.PROPERTY_TYPES = functionObject_PROPERTY_TYPES;
exports.fillDefaultValues = functionObject_fillDefaultValues;
exports.fillDefaultNames = functionObject_fillDefaultNames;
exports.keyForCode = functionObject_keyForCode;
