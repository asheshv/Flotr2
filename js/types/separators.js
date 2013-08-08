/** Separators **/
Flotr.addType('separators', {
  options: {
    show: false,           // => setting to true will show lines, false will hide
    lineWidth: 2,          // => line width in pixels
	yval: null,
    xval: null,
    xcolor: null,
    ycolor: null
  },

  /**
   * @param {Object} options
   */
  draw : function (options) {

    var
      context     = options.context,
      lineWidth   = options.lineWidth,
      shadowSize  = options.shadowSize,
      offset;

    context.save();
    context.lineJoin = 'round';
    context.lineWidth = lineWidth;

    this.plot(options);

    context.restore();
  },

  plot : function (options) {

    var
      context   = options.context,
      width     = options.width,
      height    = options.height,
      xScale    = options.xScale,
      yScale    = options.yScale,
      zero      = yScale(0),
      v, i;

    if (options.xval !== null)
    {
      v = xScale(options.xval);
      if (v >= 0 && v <= width)
      {
          context.strokeStyle = options.xcolor || options.color;
          context.beginPath();
          context.moveTo(v, 0);
          context.lineTo(v, height);
          context.stroke();
          context.closePath();
      }
    }
    if (options.yval !== null)
    {
      v = yScale(options.yval);
      if (v >= 0 && v <= height)
      {
          context.strokeStyle = options.ycolor || options.color;
          context.beginPath();
          context.moveTo(0, v);
          context.lineTo(width, v);
          context.stroke();
          context.closePath();
      }
    }
  }
});
