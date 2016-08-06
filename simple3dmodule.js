/*!
 * Very simple 3d geometry vector & matrix transformation object.
 *
 * Copyright (c) 2013 Al Grant (http://www.algrant.ca)
 *
 * Licensed under MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Based almost entirely on this: 
 * http://www.cgl.uwaterloo.ca/~csk/projects/escherization/geo.py.txt
 */

var  simple3d = module.exports = {};

simple3d.Point = function (x, y, z) {
    "use strict";

    if (!(this instanceof simple3d.Point)) {
        throw new Error("Point constructor called as function!");
    }

    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;

    this.add = function (p2) {
        return new simple3d.Point(this.x + p2.x, this.y + p2.y, this.z + p2.z);
    };

    this.clone = function () {
        return new simple3d.Point(this.x, this.y, this.z);
    }

    this.sub = function (p2) {
        return new simple3d.Point(this.x - p2.x, this.y - p2.y, this.z - p2.z);
    };

    this.mult = function (s) {
        return new simple3d.Point(this.x * s, this.y * s, this.z * s);
    };

    this.div = function (s) {
        return new simple3d.Point(this.x / s, this.y / s, this.z / s);
    };

    this.neg = function () {
        return new simple3d.Point(-this.x, -this.y, - this.z);
    };

    this.magnitude2 = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    };

    this.magnitude = function () {
        return Math.sqrt(this.magnitude2());
    };

    this.distance2 = function (p2) {
        var dx = this.x - p2.x,
            dy = this.y - p2.y;
            dz = this.z - p2.z;
        return dx * dx + dy * dy + dz * dz;
    };

    this.distance = function (p2) {
        return Math.sqrt(this.distance2(p2));
    };

    this.normalise = function () {
        return this.div(this.magnitude());
    };

    this.scale = function (sx, sy, sz) {
        return new simple3d.Point(this.x * sx, this.y * sy, this.z*sz);
    };

    this.toString = function () {
        return "Point(" + this.x + "," + this.y + "," + this.z + ")";
    };
};
