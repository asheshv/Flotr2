/** Separators **/
(function () {

Flotr.addPlugin('separators', {
	options: {
		show: false, // => setting to true will show lines, false will hide
		lineWidth: 2, // => line width in pixels
		yval: null,
		xval: null,
		xcolor: null,
		xfill: null,
		xfillopacity: 0.05,
		xorientation: 0,
		ycolor: null,
		yfill: null,
		yfillopacity: 0.05,
		yorientation: 0
	},
	callbacks: {
		'flotr:afterdraw': function() { this.separators.insertSeparator(); }
	},
	insertSeparator: function(){

		if(!this.options.separators.show)
			return;

		var opt = this.options,
			ctx = this.ctx,
			w = this.plotWidth,
			h = this.plotHeight,
			of = this.plotOffset,
			o = this.options.separators,
			xS, yS, zero, v, i, x1, x2, y1, y2;
		if (this.series) {
			for (i = 0; i < this.series.length; i++)
				if (this.series[i].hide !== true && this.series[i].xaxis && this.series[i].xaxis.d2p && this.series[i].yaxis.d2p) {
					xS = this.series[i].xaxis.d2p;
					yS = this.series[i].yaxis.d2p;
					break;
				}
			if (!xS)
				return;
		}
		else
			return;
		ctx.save();
		ctx.lineJoin = 'round';
		ctx.lineWidth = opt.lineWidth;
		if (o.xval)
		{
			v = xS(o.xval);
			if (v >= 0 && v <= w)
			{
				x1 = v + of.left; y1 = of.top; y2 = h + of.top;
				ctx.strokeStyle = o.xcolor || opt.color;
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x1, y2);
				ctx.stroke();
				ctx.closePath();
				if (o.xfill && o.xfillopacity) {
					ctx.fillStyle = this.processColor(o.xfill, {opacity: o.xfillopacity});
					if (o.xorientation === 0)
						x2 = of.left;
					else
						x2 = w + of.left;
					ctx.moveTo(x2, y1);
					ctx.lineTo(x1, y1);
					ctx.lineTo(x1, y2);
					ctx.lineTo(x2, y2);
					ctx.fill();
				}
			}
		}
		if (o.yval)
		{
			v = yS(o.yval);
			if (v >= 0 && v <= h)
			{
				x1 = of.left; x2 = w + of.left; y1 = v + of.top;
				ctx.strokeStyle = o.ycolor || opt.color;
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y1);
				ctx.stroke();
				ctx.closePath();
				if (o.yfill && o.yfillopacity) {
					ctx.fillStyle = this.processColor(o.yfill, {opacity: o.yfillopacity});
					if (o.yorientation === 0)
						y2 = of.top + h;
					else
						y2 = of.top;
					ctx.moveTo(x1, y2);
					ctx.lineTo(x1, y1);
					ctx.lineTo(x2, y1);
					ctx.lineTo(x2, y2);
					ctx.fill();
				}
			}
		}
		ctx.restore();
	}
});
})();
