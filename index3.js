// size format in gb 
var commasFormatter = d3.format(",.0f");
var sizeFormatter = function(d) {
  return commasFormatter(d) + " GB";
}

/* Tick and step values
 * Max size
 * < 100 GB           - tick values every 10GB, steps at 5GB
 * 100GB - 200GB      - tick values every 20GB, steps at 10GB
 * 200GB - 300GB      - tick values every 50GB, steps at 10GB
 * 300GB - 400GB      - tick values every 50GB, steps at 10GB
 * 400GB - 500GB      - tick values every 50GB, steps at 10GB
 * 500GB - 1000GB     - tick values every 100GB, steps at 10GB
 * 1000GB - 2000GB    - tick values every 100GB, steps at 10GB
 * > 2000GB           - tick values every 200GB, steps at 10GB
 *
 */
function genTicksForShareSize(min, max) {
  var tickValues=[], snapValues, tickStep, snapStep;
  // Assume inputs are in GB
  // convert min and max to nearest multiples of 10
  var tMin = Math.ceil10(min, 1);
  var tMax = Math.floor10(max, 1);
  var range = tMax - tMin;
  if (range <= 100) {
    snapStep = 5;
    tickStep = 10;
  } else if (range <= 500) {
    snapStep = 10;
    tickStep = 50;
  } else if (range <= 1000) {
    snapStep = 10;
    tickStep = 100;
  } else if (range <= 2000) {
    snapStep = 10;
    tickStep = 200;
  } else if (2000 < range) {
    snapStep = 10;
    tickStep = 200;
  }
  snapValues = d3.range(0, tMax, snapStep);
  snapValues[0] = 1;
  for (var i=0; i<= tMax; i+=tickStep) {
    tickValues.push(i==0 ? 1 : i);
  }
  return [tickValues, snapValues];
}


