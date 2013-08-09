(function () {

if (typeof jQuery != 'undefined') {
	var $ = jQuery;
Flotr.addPlugin('selectable_legend', {
	options: {
		show: true, // => setting to true will show the legend, hide otherwise
		noColumns: 1, // => number of colums in legend table // @todo: doesn't work for HtmlText = false
		labelFormatter: function(v){return v;}, // => fn: string -> string
		labelBoxBorderColor: '#CCCCCC', // => border color for the little label boxes
		labelBoxWidth: 14,
		labelBoxHeight: 10,
		labelBoxMargin: 5,
		id: null,
		container: null, // => container to put legend in, null means default on top of graph
		backgroundColor: '#F0F0F0', // => Legend background color.
		backgroundOpacity: 0.85, // => set to 0 to avoid background, set to 1 for a solid background
		callback : null // Set the callback for selecting/deselecting function
	},
	callbacks: {
		'flotr:afterinit': function() {
			this.selectable_legend.insertLegend();
		}
	},
	/* Adds a legend div to the canvas container */
	insertLegend: function(){

		if(!this.options.selectable_legend.show && !this.options.selectable_legend.container)
			return;

		var series = this.series,
			plotOffset = this.plotOffset,
			options = this.options,
			legend = options.selectable_legend,
			fragments = [],
			rowStarted = false, 
			ctx = this.ctx,
			itemCount = _.filter(series, function(s) {return (s.label);}).length,
			p = legend.position, 
			m = legend.margin,
			opacity = legend.backgroundOpacity,
			i, label, color;

		if (itemCount) {

			var lbw = legend.labelBoxWidth,
					lbh = legend.labelBoxHeight,
					lbm = legend.labelBoxMargin,
					offsetX = plotOffset.left + m,
					offsetY = plotOffset.top + m,
					labelMaxWidth = 0,
					style = {
						size: options.fontSize*1.1,
						color: options.grid.color
					};

			// We calculate the labels' max width
			for(i = series.length - 1; i > -1; --i){
				if(!series[i].label) continue;
				label = legend.labelFormatter(series[i].label);
				labelMaxWidth = Math.max(labelMaxWidth, this._text.measureText(label, style).width);
			}

			var legendWidth	= Math.round(lbw + lbm*3 + labelMaxWidth),
					legendHeight = Math.round(itemCount*(lbm+lbh) + lbm);

			// Default Opacity
			if (!opacity && opacity !== 0) {
				opacity = 0.1;
			}

			for(i = 0; i < series.length; ++i){
				if(!series[i].label) continue;
				
				if(i % legend.noColumns === 0){
					fragments.push(rowStarted ? '</tr><tr>' : '<tr>');
					rowStarted = true;
				}

				var s = series[i],
					boxWidth = legend.labelBoxWidth,
					boxHeight = legend.labelBoxHeight;

				label = legend.labelFormatter(s.label);
				color = 'background-color:' + ((s.bars && s.bars.show && s.bars.fillColor && s.bars.fill) ? s.bars.fillColor : s.color) + ';';
				
				if (legend.callback) {
					fragments.push(
						'<td><input type="checkbox" class="flotr-legend-check-box" data-id="',
						i, '" data-container="', (legend.id ? legend.id : ''), '"');
					if (series[i].hide !== true)
						fragments.push(' checked="checked"');
					fragments.push('/></td>');
				}
				fragments.push(
					'<td class="flotr-legend-color-box">',
					'<div style="border:1px solid ', legend.labelBoxBorderColor, ';padding:1px">');
				fragments.push(
					'<div style="width:', (boxWidth-1), 'px;height:', (boxHeight-1), 'px;border:1px solid ', series[i].color, '">', // Border
					'<div style="width:', boxWidth, 'px;height:', boxHeight, 'px;', color, '"></div>', // Background
					'</div>', '</div>', '</td>', '<td class="flotr-legend-label">');
				if (legend.callback)
					fragments.push('<label for="flotr_scb_', (legend.id ? legend.id : ''), i, '">', label, '</label>');
				else
					fragments.push(label);
				fragments.push('</td>');
			}
			if(rowStarted) fragments.push('</tr>');
				
			if(fragments.length > 0){
				var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join('') + '</table>';
				$(legend.container).html(table);

				$(legend.container).find('.flotr-legend-check-box').click(function() {
					var o = $(this);
					(legend.callback)(o.data('id'), o);
				});
			}
		}
	}
});
}
})();
