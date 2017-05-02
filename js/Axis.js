/**
 * Flotr Axis Library
 */

(function () {

var
  _ = Flotr._,
  LOGARITHMIC = 'logarithmic';

function Axis (o) {

  this.orientation = 1;
  this.offset = 0;
  this.datamin = Number.MAX_VALUE;
  this.datamax = -Number.MAX_VALUE;

  _.extend(this, o);
}


// Prototype
Axis.prototype = {

  setScale : function () {
    var
      length = this.length,
      max = this.max,
      min = this.min,
      offset = this.offset,
      orientation = this.orientation,
      options = this.options,
      logarithmic = options.scaling === LOGARITHMIC,
      scale;

    if (logarithmic) {
      scale = length / (log(max, options.base) - log(min, options.base));
    } else {
      scale = length / (max - min);
    }
    this.scale = scale;

    // Logarithmic?
    if (logarithmic) {
      this.d2p = function (dataValue) {
        return offset + orientation * (log(dataValue, options.base) - log(min, options.base)) * scale;
      };
      this.p2d = function (pointValue) {
        return exp((offset + orientation * pointValue) / scale + log(min, options.base), options.base);
      };
    } else {
      this.d2p = function (dataValue) {
        return offset + orientation * (dataValue - min) * scale;
      };
      this.p2d = function (pointValue) {
        return (offset + orientation * pointValue) / scale + min;
      };
    }
  },

  calculateTicks : function () {
    var options = this.options;

    this.ticks = [];
    this.minorTicks = [];

    // User Ticks
    if(options.ticks){
      this._cleanUserTicks(options.ticks, this.ticks);
      this._cleanUserTicks(options.minorTicks || [], this.minorTicks);
    }
    else {
      if (options.mode == 'time') {
        this._calculateTimeTicks();
      } else if (options.scaling === 'logarithmic') {
        this._calculateLogTicks();
      } else {
        this._calculateTicks();
      }
    }

    // Ticks to strings
    _.each(this.ticks, function (tick) { tick.label += ''; });
    _.each(this.minorTicks, function (tick) { tick.label += ''; });
  },

  /**
   * Calculates the range of an axis to apply autoscaling.
   */
  calculateRange: function () {

    if (!this.used) return;

    var axis  = this,
      o       = axis.options,
      min     = o.min !== null ? o.min : axis.datamin,
      max     = o.max !== null ? o.max : axis.datamax,
      margin  = o.autoscaleMargin;

    if (o.scaling == 'logarithmic') {
      if (min <= 0) min = axis.datamin;

      // Let it widen later on
      if (max <= 0) max = min;
    }

    if (max == min) {
      var widen = max ? 0.01 : 1.00;
      if (o.min === null) min -= widen;
      if (o.max === null) max += widen;
    }

    if (o.scaling === 'logarithmic') {
      if (min < 0) min = max / o.base;  // Could be the result of widening

      var maxexp = Math.log(max);
      if (o.base != Math.E) maxexp /= Math.log(o.base);
      maxexp = Math.ceil(maxexp);

      var minexp = Math.log(min);
      if (o.base != Math.E) minexp /= Math.log(o.base);
      minexp = Math.ceil(minexp);

      axis.tickSize = Flotr.getTickSize(o.noTicks, minexp, maxexp, o.tickDecimals === null ? 0 : o.tickDecimals);

      // Try to determine a suitable amount of miniticks based on the length of a decade
      if (o.minorTickFreq === null) {
        if (maxexp - minexp > 10)
          o.minorTickFreq = 0;
        else if (maxexp - minexp > 5)
          o.minorTickFreq = 2;
        else
          o.minorTickFreq = 5;
      }
    } else {
      axis.tickSize = Flotr.getTickSize(o.noTicks, min, max, o.tickDecimals);
    }

    axis.min = min;
    axis.max = max; //extendRange may use axis.min or axis.max, so it should be set before it is caled

    // Autoscaling. @todo This probably fails with log scale. Find a testcase and fix it
    if(o.min === null && o.autoscale){
      axis.min -= axis.tickSize * margin;
      // Make sure we don't go below zero if all values are positive.
      if(axis.min < 0 && axis.datamin >= 0) axis.min = 0;
      axis.min = axis.tickSize * Math.floor(axis.min / axis.tickSize);
      axis.min = axis.min - (axis.tickSize * 0.01);
    }

    if(o.max === null && o.autoscale){
      axis.max += axis.tickSize * margin;
      if(axis.max > 0 && axis.datamax <= 0 && axis.datamax != axis.datamin) axis.max = 0;
      axis.max = axis.tickSize * Math.ceil(axis.max / axis.tickSize);
      axis.max = (axis.tickSize * 0.01) + axis.max;
    }
    axis.max = (axis.tickSize || 0) * 0.02 + axis.max;

    if (axis.min == axis.max) axis.max = axis.min + 1;
  },

  calculateTextDimensions : function (T, options) {

    var maxLabel = '',
      length,
      i;

    if (this.options.showLabels) {
      for (i = 0; i < this.ticks.length; ++i) {
        length = this.ticks[i].label.length;
        if (length > maxLabel.length){
          maxLabel = this.ticks[i].label;
        }
      }
    }

    this.maxLabel = T.dimensions(
      maxLabel,
      {size:options.fontSize*1.2, fontFamily: options.fontFamily, angle: Flotr.toRad(this.options.labelsAngle)},
      'font-size:smaller;',
      'flotr-grid-label'
    );

    this.titleSize = T.dimensions(
      this.options.title,
      {size:options.fontSize*1.2, fontFamily: options.fontFamily, angle: Flotr.toRad(this.options.titleAngle)},
      'font-weight:bold;',
      'flotr-axis-title'
    );
  },

  _cleanUserTicks : function (ticks, axisTicks) {

    var axis = this, options = this.options,
      v, i, label, tick;

    if(_.isFunction(ticks)) ticks = ticks({min : axis.min, max : axis.max});

    for(i = 0; i < ticks.length; ++i){
      tick = ticks[i];
      if(typeof(tick) === 'object'){
        v = tick[0];
        label = (tick.length > 1) ? tick[1] : options.tickFormatter(v, {min : axis.min, max : axis.max});
      } else {
        v = tick;
        label = options.tickFormatter(v, {min : this.min, max : this.max});
      }
      axisTicks[i] = { v: v, label: label };
    }
  },

  _calculateTimeTicks : function () {
    this.ticks = Flotr.Date.generator(this);
  },

  _calculateLogTicks : function () {

    var axis = this,
      o = axis.options,
      v,
      decadeStart;

    var max = Math.log(axis.max);
    if (o.base != Math.E) max /= Math.log(o.base);
    max = Math.ceil(max);

    var min = Math.log(axis.min);
    if (o.base != Math.E) min /= Math.log(o.base);
    min = Math.ceil(min);

    for (i = min; i < max; i += axis.tickSize) {
      decadeStart = (o.base == Math.E) ? Math.exp(i) : Math.pow(o.base, i);
      // Next decade begins here:
      var decadeEnd = decadeStart * ((o.base == Math.E) ? Math.exp(axis.tickSize) : Math.pow(o.base, axis.tickSize));
      var stepSize = (decadeEnd - decadeStart) / o.minorTickFreq;

      axis.ticks.push({v: decadeStart, label: o.tickFormatter(decadeStart, {min : axis.min, max : axis.max})});
      for (v = decadeStart + stepSize; v < decadeEnd; v += stepSize)
        axis.minorTicks.push({v: v, label: o.tickFormatter(v, {min : axis.min, max : axis.max})});
    }

    // Always show the value at the would-be start of next decade (end of this decade)
    decadeStart = (o.base == Math.E) ? Math.exp(i) : Math.pow(o.base, i);
    axis.ticks.push({v: decadeStart, label: o.tickFormatter(decadeStart, {min : axis.min, max : axis.max})});
  },

  _calculateTicks : function () {

    var axis      = this,
        o         = axis.options,
        tickSize  = axis.tickSize,
        min       = axis.min,
        max       = axis.max,
        start     = tickSize * Math.ceil(min / tickSize), // Round to nearest multiple of tick size.
        decimals,
        minorTickSize,
        v, v2,
        i, j;

    if (o.minorTickFreq)
      minorTickSize = tickSize / o.minorTickFreq;

    // Then store all possible ticks.
    for (i = 0; (v = v2 = start + i * tickSize) <= max; ++i){

      // Round (this is always needed to fix numerical instability).
      decimals = o.tickDecimals;
      if (decimals === null) decimals = 1 - Math.floor(Math.log(tickSize) / Math.LN10);
      if (decimals < 0) decimals = 0;

      v = v.toFixed(decimals);
      axis.ticks.push({ v: v, label: o.tickFormatter(v, {min : axis.min, max : axis.max}) });

      if (o.minorTickFreq) {
        for (j = 0; j < o.minorTickFreq && (i * tickSize + j * minorTickSize) < max; ++j) {
          v = v2 + j * minorTickSize;
          axis.minorTicks.push({ v: v, label: o.tickFormatter(v, {min : axis.min, max : axis.max}) });
        }
      }
    }

  }
};


// Static Methods
_.extend(Axis, {
  getAxes : function (options) {
    return {
      x:  new Axis({options: options.xaxis,  n: 1, length: this.plotWidth}),
      x2: new Axis({options: options.x2axis, n: 2, length: this.plotWidth}),
      y:  new Axis({options: options.yaxis,  n: 1, length: this.plotHeight, offset: this.plotHeight, orientation: -1}),
      y2: new Axis({options: options.y2axis, n: 2, length: this.plotHeight, offset: this.plotHeight, orientation: -1})
    };
  }
});


// Helper Methods


function log (value, base) {
  value = Math.log(Math.max(value, Number.MIN_VALUE));
  if (base !== Math.E)
    value /= Math.log(base);
  return value;
}

function exp (value, base) {
  return (base === Math.E) ? Math.exp(value) : Math.pow(base, value);
}

Flotr.Axis = Axis;

})();
