
var svg_lines = []
function insert_plot(svg_file, hide_curves=true){

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
        var nCurves =1;

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
                           .attr("id", "curve"+(svg_lines.length+1)+"_"+nCurves)

              // Hide curve
              if (hide_curves)
                path.attr("stroke-dasharray", "0,"+path.node().getTotalLength())

              nCurves += 1;
            });

        // Counting curves
        svg_lines.push(nCurves-1)

      });
}

function reveal_path(id, duration=2000, delay=0){

    d3.select(id)
      .transition()
      .delay(delay)
      .duration(duration)
      .attrTween("stroke-dasharray", function () {
          var l = this.getTotalLength(),
              i = d3.interpolateString("0,"+l, l+","+l);

          return (t) => i(t); 
        });
}

function erase_path(id, duration=2000, delay=0){

    d3.select(id)
      .transition()
      .delay(delay)
      .duration(duration)
      .attrTween("stroke-dasharray", function () {
          var l = this.getTotalLength(),
              i = d3.interpolateString(l+","+l, "0,"+l);

          return (t) => i(t); 
        });
}