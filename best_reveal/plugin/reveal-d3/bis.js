var nSvg_ = 1
var d_legs = {}
var effects = {}
var svg_objs = []
var trans_in = {}
var trans_out = {}
var trans_auto = true
var _transitions = []


/*
function insert_plot_old(svg_file, hide_curves=true){

  	// Create div
  	if (d3.select("#plots").empty())
    	d3.select("body").append("div")
            .attr("id", "plots")
            .attr("align", "center")

  	// Add svg to html and ids
  	d3.xml(svg_file)
      	.then(data => {

        	// Add svg to div
        	d3.select("#plots").node().append(data.documentElement);

	        // Add white space
	        d3.select("#plots").append("span").text("___")
	        .style('color', d3.select("body").style("background-color"))
	        
	        // Set fixed height
	        d3.selectAll("svg").attr('height', 500).attr("width", "auto")
	        				   
	        var s = document.getElementsByTagName('svg')
	        var svg = d3.select(s[s.length - 1])
	        			.attr("id","svg"+(svg_objs.length+1))
	        var nCurves =1;

	        // Searching curves
	        svg.selectAll("g").filter(function (d,i){
					// Filter curves
					var g = d3.select(this).attr("id")
					if (g && g.includes("line2d")){

					if (d3.select(this.parentNode).attr("id").includes("axes"))
					  return true;

				}}).each( function (d,i){
	              	// Add id to curves
	              	var path = d3.select(this).select("path")
	                           .attr("id", "curve"+(svg_objs.length+1)+"_"+nCurves)

	              	// Hide curve
	              	if (hide_curves)
	                	path.attr("stroke-dasharray", "0,"+path.node().getTotalLength())

	              	nCurves += 1;
	            });

	        // Counting curves
	        svg_objs.push(nCurves-1)
	        console.log('A')
	    });
      	console.log('B')
}
*/


function insert_plot(svg_file, hide_svg=false, hide_objs=true){

  // Create div
  if (d3.select("#plots").empty())
    d3.select("body").append("div")
                   .attr("id", "plots")
                   .attr("align", "center")

  // Add svg to html and ids
  d3.xml(svg_file)
      .then(data => {

        // Add svg to div
        d3.select("#plots").node().append(data.documentElement);

        // Add white space
        d3.select("#plots").append("span").text("___")
        .style('color', d3.select("body").style("background-color"))
        
        // Set fixed height
        d3.selectAll("svg").attr('height', 500).attr("width", "auto")
        				   
        var s = document.getElementsByTagName('svg')
        var svg = d3.select(s[s.length - 1])
        			.attr("id","svg"+(svg_objs.length+1))
        var nCurves =1;
        var curves = []

        // Searching curves
        svg.selectAll("g").filter(function (d,i){
              // Filter curves
              var g = d3.select(this).attr("id")
              if (g && g.includes("line2d")){
                
                if (d3.select(this.parentNode).attr("id").includes("axes"))
                  return true;
              }})
            .each( function (d,i){
              // Add id to curves
              var path = d3.select(this).select("path")
                           .attr("id", "obj"+(svg_objs.length+1)+"_"+nCurves)

              // Add curves
              curves.push(path);
              nCurves += 1;
            });

        // Saving curves
        svg_objs.push(nCurves-1);
        var nSvg = svg_objs.length;

        // Set transitions
        set_svg_transition(svg, hide_svg)
        set_curve_transitions(curves, hide_objs)

        // Searching legends
        var legs = []
        for (var l=1; l < nCurves; l++){
        	var leg = d3.select("#legend_"+l).attr("id", "leg"+nSvg+"_"+l)

			    d_legs["#"+leg.attr("id")] = ["#"+curves[l-1].attr("id")]

        	if (!leg.empty())
        		legs.push(leg)
        }

        // Initialize plot
        init_svg(nSvg, svg, curves);

        // Initialize legend
        init_leg(nSvg, svg, legs)

        // Initialize effects
        init_effects(svg, curves)

      })

	  // Set transition
      var len = Object.keys(trans_in).length

	  if (nSvg_ != 1){
	    len += 1
  		trans_in[len] = ["#svg" + nSvg_]
	  }

	  trans_in[len+1] = [...Array(20).keys()].map( v => "#obj"+nSvg_+"_"+v) 

      nSvg_ += 1
}


function init_svg(nSvg, svg, objs){}

function init_effects(svg, objs){
  var ids = objs.map( obj => '#'+obj.attr("id"))
  ids.push('#'+svg.attr("id"))

  ids.map( id => {
  	if (id in effects && "init" in effects[id]){
  		var fun = effects[id]["init"]

  		if (fun != null)
  			fun(id);
  	}
  })
}


function init_leg(nSvg, svg, legs){
  legs.map((leg) => {
    leg.on("click", function(){

      var it = d3.select(this);
      var id_ = it.attr("id");
      var active, newOpacity;

      if (it.attr("active")!="false"){
        active = false;
        newOpacity = 0.5;
      }
      else{
        active = true;
        newOpacity = 1.0;
      }

      if (active)
        show_objs(d_legs["#"+id_])
      else
        hide_objs(d_legs["#"+id_])

      it.style("opacity", active ? 1.0 : 0.5)
        .attr("active", active);

    })
  });
}

function set_svg_transition(svg, bhide=false){

	var id = "#"+svg.attr("id")

	if (!(id in effects))
		effects[id] = {}

	var d = effects[id]

	if (!("in" in d))
		d["in"] = show

	if (!("out" in d))
		d["out"] = hide

	if (!("init" in d) && bhide)
		d["init"] = hide
}

function set_curve_transitions(curves, bhide=false){
	curves.map( curve => {
	  	var id = "#"+curve.attr("id")
	  	if (!(id in effects))
	  		effects[id] = {}

	  	var d = effects[id]

	  	if (!("in" in d))
	  		d["in"] = reveal_curve

	  	if (!("out" in d))
	  		d["out"] = erase_curve

	  	if (!("init" in d) && bhide == true)
	  		d["init"] = hide
	  		
	  })
}


function set_transitions(trans_in, trans_out={}){
  _transitions = []
  for (var i=0; i< Object.keys(trans_in).length; i++){
    _transitions.push(get_transition(i+1))
  }
}


function apply_effects(trans, i, type="in"){
  if (i in trans){
    trans[i].map( (obj) => {
    	if (obj in effects && type in effects[obj]){
    		var fun = effects[obj][type];

    		if (fun)
    			fun(obj);
    	}
    });
  }
}

function get_transition(i){

  return {
    transitionForward: () => {
      apply_effects(trans_in, i, "in")
      apply_effects(trans_out, i, "out")
    },
    transitionBackward: () => {
      apply_effects(trans_in, i, "out")
      apply_effects(trans_out, i, "in")
    }
  }
}

function get_selection(name){
	if (name instanceof d3.selection)
		return name;

	else {
		if (name.includes("#"))
			return d3.select(name);

		else
			return d3.select("#"+name);
	}
}

function reveal_curve(id, duration=2000, delay=0){

    show(get_selection(id))
    	.transition()
      	.delay(delay)
      	.duration(duration)
      	.attrTween("stroke-dasharray", function () {
          	var l = this.getTotalLength(),
              	i = d3.interpolateString("0,"+l, l+","+l);

          	return (t) => i(t); 
        });
}

function erase_curve(id, duration=2000, delay=0){

    get_selection(id)
      .transition()
      .delay(delay)
      .duration(duration)
      .attrTween("stroke-dasharray", function () {
          var l = this.getTotalLength(),
              i = d3.interpolateString(l+","+l, "0,"+l);

          return (t) => i(t); 
        });
}

function hide(id){
	get_selection(id).style("display", "none");
}

function cover(id){
	get_selection(id).style("visibility", "hidden");
}

function show(id){
	return get_selection(id)
				.style("visibility", "visible")
	            .style("display", "inline");
}


function show_obj(id){
  effects[id]["in"](id);
}

function hide_obj(id){
  effects[id]["out"](id);
}

function hide_objs(ids){
  ids.map( (v) => hide_obj(v));
}

function show_objs(ids){
  ids.map( (v) => show_obj(v));
}

/*

function reveal_curves(ids, duration=2000, delay=0){

	ids.forEach( (id) => reveal_curve(id, duration, delay) )
}

function erase_paths(ids, duration=2000, delay=0){

	ids.forEach( (id) => erase_curve(id, duration, delay) )
}
function hide_elements(ids, duration=2000, delay=0){
	
	ids.forEach( (id) => hide(id, duration, delay))
}

function cover_elements(ids, duration=2000, delay=0){
	
	ids.forEach( (id) => cover(id, duration, delay))
}

function show_elements(ids, duration=2000, delay=0){
	
	ids.forEach( (id) => show(id, duration, delay))
}



function show_obj(id){
  d_shows[id]();
}

function hide_obj(id){
  d_hides[id]();
}

function hide_objs(ids){
  ids.map( (v) => hide_obj(v));
}

function show_objs(ids){
  ids.map( (v) => show_obj(v));
}



function transition_path_step(data){

  var paths = [];
  var figs_show = []
  var figs_hide = []

  var ids_show = [];
  var ids_hide = [];

  for (var nFig in data){
    var nCurve = data[nFig];

    if (nCurve.isArray){
      nCurve.forEach( v => paths.push("#obj"+nFig+"_"+v))
      nCurve.forEach( v => ids_show.push("#obj"+nFig+"_"+v))
    }
    else if (nCurve === true){
      figs_show.push("#svg"+nFig)
      ids_show.push("#svg"+nFig)
    }

    else if (nCurve === false){
      figs_hide.push("#svg"+nFig)
      ids_hide.push("#svg"+nFig)
    }

    else{
      paths.push("#obj"+nFig+"_"+nCurve);
      ids_show.push("#obj"+nFig+"_"+nCurve);
    }
  }

  return {
    transitionForward: () => { reveal_curves(paths); 
                               show_elements(figs_show);
                               hide_elements(figs_hide);
                             },
    transitionBackward: () => { erase_paths(paths);
                                hide_elements(figs_show);
                                show_elements(figs_hide);
                              }
  };

}

function transitions_path(...data){

  _transitions =  data.map( v => transition_path_step(v));

  return _transitions

}
*/
// var _transitions = [
//       {
//         // transitionForward: () => reveal_curves(["#curve1_1","#curve2_1"]),
//         // transitionBackward: () => erase_paths(["#curve1_1","#curve2_1"]),
//         transitionForward: () => reveal_curve("#obj1_1"),
//         transitionBackward: () => erase_curve("#obj1_1"),
//       },
//       {
//         transitionForward: () => show("#svg2"),
//         transitionBackward: () => hide("#svg2"),
//       },
//       {
//         transitionForward: () => reveal_curve("#obj2_1"),
//         transitionBackward: () => erase_curve("#obj2_1"),
//       },
//     ]