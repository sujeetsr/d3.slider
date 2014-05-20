d3.slider = function module() {
  "use strict";

  var min = 0, max = 100, svg, svgGroup, value, classPrefix, axis, 
  height=40, rect,
  rectHeight = 12,
  tickSize = 6,
  margin = {top: 25, right: 25, bottom: 15, left: 25}, 
  ticks = 0, tickValues, scale, tickFormat, dragger, width, 
  range = false,
  callbackFn, stepValues, focus;

  function slider(selection) {
    selection.each(function() {
      var div = d3.select(this).classed('d3slider', true);
      width = parseInt(div.style("width"), 10)-(margin.left 
                                                + margin.right);

      value = value || min; 
      scale = d3.scale.linear().domain([min, max]).range([0, width])
      .clamp(true);
      
      // SVG 
      svg = div.append("svg")
      .attr("class", "d3slider-axis")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + 
            "," + margin.top + ")");

      // Range rect
      svg.append("rect")
      .attr("class", "d3slider-rect-range")
      .attr("width", width)
      .attr("height", rectHeight);
     
      // Range rect 
      if (range) {
        svg.append("rect")
        .attr("class", "d3slider-rect-value")
        .attr("width", scale(value))
        .attr("height", rectHeight);
      }
      
      // Axis      
      var axis = d3.svg.axis()
      .scale(scale)
      .orient("bottom");
      
      if (ticks != 0) {
        axis.ticks(ticks);
        axis.tickSize(tickSize);
      } else if (tickValues) {
        axis.tickValues(tickValues);
        axis.tickSize(tickSize);
      } else {
        axis.ticks(0);
        axis.tickSize(0);
      }
      if (tickFormat) {
        axis.tickFormat(tickFormat);
      }
      
      svg.append("g")
      .attr("transform", "translate(0," + rectHeight + ")")
      .call(axis)
      //.selectAll(".tick")
      //.data(tickValues, function(d) { return d; })
      //.exit()
      //.classed("minor", true);
   
      // Min marker
      //var minMarker = svgGroup.append("g")
      //.attr("class", "min-marker")
      //.attr("transform", "translate(" + scale(min) + ")");

      //minMarker.append("text")
      //.attr("x", 0)
      //.attr("y", -15)
      //.attr("text-anchor", "middle")
      //.text(min + " GB");

      //minMarker.append("line")
      //.attr("x1", scale(min))
      //.attr("y1", 0)
      //.attr("x2", scale(min))
      //.attr("y2", -15);

      //// Max marker
      //var maxMarker = svgGroup.append("g")  
      //.attr("class", "max-marker")
      //.attr("transform", "translate(" + scale(max) + ")");

      //maxMarker.append("text")
      //.attr("x", 0)
      //.attr("y", -15)
      //.attr("text-anchor", "middle")
      //.text(max + " GB");

      //minMarker.append("line")
      //.attr("x1", scale(max))
      //.attr("y1", 0)
      //.attr("x2", scale(max))
      //.attr("y2", -15);
       
      var values = [value];
      dragger = svg.selectAll(".dragger")
      .data(values)
      .enter()
      .append("g")
      .attr("class", "dragger")
      .attr("transform", function(d) {
        return "translate(" + scale(d) + ")";
      }) 
     
      
      dragger.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("class", "draggertext")
      .text(d3.format(",.0f")(value));

      dragger.append("circle")
      .attr("class", "dragger-outer")
      .attr("r", 8)
      .attr("transform", function(d) {
        return "translate(0,6)";
      });
      
      dragger.append("circle")
      .attr("class", "dragger-inner")
      .attr("r", 4)
      .attr("transform", function(d) {
        return "translate(0,6)";
      });

      //dragger.append("rect")
      //.attr("class", "dragger-rect")
      //.attr("width", 10)
      //.attr("height", rectHeight+4)
      //.attr("transform", function(d) {
      //  return "translate(-5,-2)";
      //}) 

      // Enable dragger drag 
      var dragBehaviour = d3.behavior.drag();
      dragBehaviour.on("drag", slider.drag);
      dragger.call(dragBehaviour);
      
      // Move dragger on click 
      svg.on("click", slider.click);

      //focus = svg.append("g")
      //.style("display", "none");
      
      //focus.append("line")
      //.attr("x1", 0)
      //.attr("y1", 0)
      //.attr("x2", 0)
      //.attr("y2", rectHeight);
      
      //focus.append("text")
      //.attr("x", 0)
      //.attr("y", -15)
      //.attr("text-anchor", "middle")
      //.text("");
      
      //svg.append("rect")
      //.attr("class", "overlay")
      //.attr("width", width)
      //.attr("height", height)
      //.on("mouseover", function() { focus.style("display", null); })
      //.on("mouseout", function() { focus.style("display", "none"); })
      //.on("mousemove", slider.mousemove);
      

    });
  }

  slider.draggerTranslateFn = function() {
    return function(d) {
      return "translate(" + scale(d) + ")";
    }
  }

  slider.click = function() {
    var pos = d3.event.offsetX || d3.event.layerX;
    slider.move(pos);
  }

  slider.drag = function() {
    var pos = d3.event.x;
    slider.move(pos+margin.left);
  }

  slider.move = function(pos) {
    var l,u;
    var newValue = scale.invert(pos - margin.left);
    // find tick values that are closest to newValue
    // lower bound
    if (stepValues != undefined) {
      l = stepValues.reduce(function(p, c, i, arr){
        if (c < newValue) {
          return c;
        } else {
          return p;
        }
      });

      // upper bound
      if (stepValues.indexOf(l) < stepValues.length-1) {
        u = stepValues[stepValues.indexOf(l) + 1];
      } else {
        u = l;
      }
      // set values
      var oldValue = value;
      value = ((newValue-l) <= (u-newValue)) ? l : u;
    } else {
      var oldValue = value;
      value = newValue;
    }
    var values = [value];

    // Move dragger
    svg.selectAll(".dragger").data(values)
    .attr("transform", function(d) {
      return "translate(" + scale(d) + ")";
    });
    
    svg.selectAll(".dragger").select("text")
    .text(d3.format(",.0f")(value));
   
    if (range) { 
      svg.selectAll(".d3slider-rect-value")
      .attr("width", scale(value));
    }

    if (callbackFn) {
      callbackFn(slider);
    }
  }

  // Getter/setter functions
  slider.min = function(_) {
    if (!arguments.length) return min;
    min = _;
    return slider;
  };

  slider.max = function(_) {
    if (!arguments.length) return max;
    max = _;
    return slider;
  };

  slider.classPrefix = function(_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return slider;
  }

  slider.tickValues = function(_) {
    if (!arguments.length) return tickValues;
    tickValues = _;
    return slider;
  }
 
  slider.ticks = function(_) {
    if (!arguments.length) return ticks;
    ticks = _;
    return slider;
  }

  slider.stepValues = function(_) {
    if (!arguments.length) return stepValues;
    stepValues = _;
    return slider;
  }
  
  slider.tickFormat = function(_) {
    if (!arguments.length) return tickFormat;
    tickFormat = _;
    return slider;
  } 

  slider.value = function(_) {
    if (!arguments.length) return value;
    value = _;
    return slider;
  } 
  
  slider.showRange = function(_) {
    if (!arguments.length) return range;
    range = _;
    return slider;
  } 

  slider.callback = function(_) {
    if (!arguments.length) return callbackFn;
    callbackFn = _;
    return slider;
  }

  slider.setValue = function(newValue) {
    var pos = scale(newValue) + margin.left;
    slider.move(pos);
  }

  slider.mousemove = function() {
    var pos = d3.mouse(this)[0];
    var val = slider.getNearest(scale.invert(pos), stepValues);
    focus.attr("transform", "translate(" + scale(val) + ",0)");
    focus.selectAll("text").text(val);
  }
  
  slider.getNearest = function(val, arr) {
    var l = arr.reduce(function(p, c, i, a){
      if (c < val) {
        return c;
      } else {
        return p;
      }
    });
    var u = arr[arr.indexOf(l)+1];
    var nearest = ((value-l) <= (u-value)) ? l : u;
    return nearest;
  }

  return slider;

};

(function(){

	/**
	 * Decimal adjustment of a number.
	 *
	 * @param	{String}	type	The type of adjustment.
	 * @param	{Number}	value	The number.
	 * @param	{Integer}	exp		The exponent (the 10 logarithm of the adjustment base).
	 * @returns	{Number}			The adjusted value.
	 */
	function decimalAdjust(type, value, exp) {
		// If the exp is undefined or zero...
		if (typeof exp === 'undefined' || +exp === 0) {
			return Math[type](value);
		}
		value = +value;
		exp = +exp;
		// If the value is not a number or the exp is not an integer...
		if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
			return NaN;
		}
		// Shift
		value = value.toString().split('e');
		value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
		// Shift back
		value = value.toString().split('e');
		return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
	}

	// Decimal round
	if (!Math.round10) {
		Math.round10 = function(value, exp) {
			return decimalAdjust('round', value, exp);
		};
	}
	// Decimal floor
	if (!Math.floor10) {
		Math.floor10 = function(value, exp) {
			return decimalAdjust('floor', value, exp);
		};
	}
	// Decimal ceil
	if (!Math.ceil10) {
		Math.ceil10 = function(value, exp) {
			return decimalAdjust('ceil', value, exp);
		};
	}

})();


