/**
 *
 * @param object
 * @param keySet
 * @param value
 * @return {*}
 */
function addValue(object, keySet, value) {
    "use strict";
    keySet = keySet.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    keySet = keySet.replace(/^\./, ''); // strip a leading dot
    var keys = keySet.split('.');
    var add = function(obj) {
        var key = keys.shift();
        if (key === null || keys.length === 0) {
            obj[key] = value;
            return false;
        } else if (obj[key] === null || typeof obj[key] !== "object") {
            obj[key] = !isNaN(parseInt(keys[0])) ? [] : {};
        }
        add(obj[key]);
    };
    add(object);
    return object;
}

/**
 *
 * @param data
 * @param width
 * @param height
 * @param plotOnly
 * @param scale
 */
function drawChart(data, width, height, plotOnly, scale) {
    
    
    var yAxes = getPropVal(data, "metadata.axes.y") || [];
    var isMulti = yAxes > 1;
    
    if (plotOnly) {
        data = restToPlotData(data, isMulti);
        data = disableThreshold(data);
    }
    
    /*
     * Change plot mode to svg
     */
    
    // addValue(data, "chart.plot.renderer.mode", "svg");
    addValue(data, "canvas.border.show", false);
    addValue(data, "canvas.shadow.show", false);
    
    
    data = disableAnimation(data);
    
    addValue(data, "canvas.events.onload", function() {
        if (scale > 1) {
            d3.select("#container").styles({
                "-webkit-transform": "scale(" + scale + ")",
                "-webkit-transform-origin": "top"
            });
        }
        window.canvasLoaded = true;
    });
    
    // fix HiDPI screen.
    window.devicePixelRatio = 2;
    
    /*
     * Chart Holder
     */
    
    var container = document.getElementById('container');
    container.style.width = width + "px";
    container.style.height = height + "px";
    
    /* Draw The Chart */
    
    renderChart(container, data, function(chartObj) {
        window.chartObj = chartObj;
    });
}

/**
 *
 * @param data
 * @param isMulti
 * @return {*}
 */
function restToPlotData(data, isMulti) {
    
    /*
     * Genetate only the plot.
     */
    
    addValue(data, 'canvas.border.show', false);
    addValue(data, 'canvas.shadow.shadowColor', 'rgba(0,0,0,0)');
    
    addValue(data, 'canvas.background.alpha', '0');
    addValue(data, 'chart.plot.background.color', 'rgba(0,0,0,0)');
    addValue(data, 'chart.axes.xaxis.grid.color', 'rgba(0,0,0,0)');
    addValue(data, 'chart.axes.yaxis[0].grid.color', 'rgba(0,0,0,0)');
    addValue(data, 'chart.axes.yaxis[0].axisline.color', 'rgba(0,0,0,0)');
    addValue(data, 'chart.axes.xaxis.axisline.color', 'rgba(0,0,0,0)');
    
    addValue(data, 'chart.marginTop', '0');
    addValue(data, 'chart.marginRight', '0');
    addValue(data, 'chart.marginBottom', '0');
    addValue(data, 'chart.marginLeft', '0');
    
    addValue(data, 'credits.enabled', 'false');
    
    addValue(data, 'canvas.title.show', 'false');
    addValue(data, 'canvas.subtitle.show', 'false');
    addValue(data, 'notes.enabled', 'false');
    
    addValue(data, 'chart.axes.xaxis.show', 'false');
    
    var yAxes = getPropVal(data, "metadata.axes.y") || [];
    
    if (isMulti) {
        for (var i = 0; i < yAxes.length; i++) {
            addValue(data, 'chart.axes.yaxis[' + i + '].show', 'false');
        }
    } else {
        addValue(data, 'chart.axes.yaxis[0].show', 'false');
    }
    
    addValue(data, 'legend.enabled', 'false');
    return data;
}

/**
 *
 * @param type
 */
function getChartDetails(type) {
    if (type == null) {
        return
    }
    var chartType,
        isInt = !(isNaN(parseInt(type)));
    var chartType = {};
    chartType.value = (isInt) ? parseInt(type) : ($ZC.charttype[type.toString().toLowerCase()]);
    chartType.name = (isInt) ? $ZC.charttypenames.get(parseInt(type)) : type.toString().toLowerCase();
    return chartType;
}

/**
 *
 * @param data
 * @return {*}
 */
function disableAnimation(data) {
    var charttype, chartdata = getPropVal(data, "seriesdata.chartdata") || [];
    chartdata.forEach(function(seriesdata, i) {
        charttype = chartdata[i].type || data.seriesdata.type;
        addValue(data, "chart.plot.animation.enabled", 'false');
        addValue(data, "chart.plot.plotoptions." + getChartDetails(charttype).name + ".animation.enabled", 'false');
        
    });
    return data;
}

/**
 *
 * @param data
 * @return {*}
 */
function disableThreshold(data) {
    var chartdata = data.seriesdata.chartdata;
    addValue(data, "chart.axes.xaxis.threshold.line.show", 'false');
    addValue(data, "chart.axes.xaxis.threshold.range.show", 'false');
    
    chartdata.forEach(function(seriesdata, i) {
        addValue(data, "chart.axes.yaxis[" + i + "].threshold.line.show", 'false');
        addValue(data, "chart.axes.yaxis[" + i + "].threshold.range.show", 'false');
    });
    return data;
}

/**
 *
 * @param json
 * @return {boolean}
 */
function isMapChart(json) {
    var series = getPropVal(json, "seriesdata") || {},
        globalSeriesType = series.type,
        chartSeriesType = getPropVal(series, "chartdata[0].type"),
        geoRegex = /(geo|30)/ig;
    return geoRegex.test(globalSeriesType) ||
        geoRegex.test(chartSeriesType) ||
        (!globalSeriesType && !chartSeriesType && !!(json.map && json.map.scope))
}

/**
 *
 * @param chartHolder
 * @param data
 * @param postRenderAction
 */
function renderMapChart(chartHolder, data, postRenderAction) {
    var mapData = $ZC.mapCollections[data.map.scope];
    
    if (!mapData) {
        
        var width = chartHolder.clientWidth,
            height = chartHolder.clientHeight;
        
        // add a loader
        var parent = d3.select(chartHolder).append("div").styles({
            "position": "relative",
            "width": width + "px",
            "height": height + "px",
            "background": "white"
        });
        parent.append("div").attr("class", "map-script-loader pace-active");
        
        // code check error
        var protocol = "ht" + "tp://";
        
        getScript(protocol + "zohocharts/demo/maps/get-map.php?scope=" + data.map.scope, function() {
            parent.remove();
            var chartObj = new $ZC.maps(chartHolder, data);
            if (typeof postRenderAction === "function") {
                postRenderAction(chartObj);
            }
        })
    } else {
        var chartObj = new $ZC.maps(chartHolder, data);
        if (typeof postRenderAction === "function") {
            postRenderAction(chartObj);
        }
    }
}

/**
 *
 * @param url
 * @param success
 */
function getScript(url, success) {
    var head = document.getElementsByTagName("head")[0], done = false;
    var script = document.createElement("script");
    script.src = url;
    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            if (typeof success === 'function') {
                success();
            }
        }
    };
    head.appendChild(script);
}

/**
 * 1
 * @param chartHolder
 * @param data
 * @param callback
 */
function renderChart(chartHolder, data, callback) {
    if (isMapChart(data)) {
        renderMapChart(chartHolder, data, callback)
    } else {
        var chartObj = new $ZC.charts(chartHolder, data);
        if (typeof callback === "function") {
            callback(chartObj);
        }
    }
}

/**
 *
 * @param obj
 * @param key
 * @return {*}
 */
function getPropVal(obj, key) {
    var keySet = key.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    keySet = keySet.replace(/^\./, ''); // strip a leading dot
    var keys = keySet.split('.');
    return keys.reduce(function(o, x) {
        return !defined(o) ? o : o[x];
    }, obj);
    
}

/**
 *
 * @param obj
 * @return {boolean}
 */
function defined(obj) {
    return obj !== undefined && obj !== null;
}