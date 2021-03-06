// ===================================================
// ===================================================
// Twitter analysis V3
// Frank Dullweber, 5.8.2015
// ===================================================
// ===================================================

// Layout of Webpage
//
/* WRAPPER around everything
+---------------------------------------------------+
|      HEADER  (with buttons ID_RADIO_HASHTAG)      |                                                        |
+---------------------------------------------------+
|SIDEBAR      |SIDEBAR2          | MAIN_CONTENT     | outer container
|SVG          |SVG2              | DIV3             | variable
|TOP_HASHAGS  | TOP_TWITTERER    | ALL_TAGS         | inner container
+---------------------------------------------------+
|       FOOTER                                      |
+------------------------------------------ --------+
*/


/* DATA FILES
The CSV files with the data are expected in the subdirectory data/ .
The file names consists of the queried hashtag and a time stamp for
the specific month, e.g. hashtag-2015-1.csv.

At the moment the hashtags and months (with their "hyperlinks")
shown in the HTML page are hardcoded in the HTML code.
The future idea is to genrate these in a ynamic manner.

The CSV format of the files is like this:
type,value,count,flag
"top_hashtag","genomics",100,"none"
"top_twitterer","genomics",200,"none"
"tag","Genetics-9",70,"conference"
"tag","obesity",60,"mesh"
"tag","tag7",40,"none"

The data within the files should be sorted by count field in
descending order.
*/

// ===================================================
// ===================================================
// global declarations
// ===================================================
// ===================================================

// global variables for TOP_HASHTAG
var svg; //SVG for top hashtag on left side of window
var bars; // horizontal bars for top hashtags
var max; // maximum value for these bars, used for D3 scale
var xScale; // D3 scale
var xAxis; // x axis

// global variables for TOP_TWITTERER
var svg2; //SVG for top twitterer in the middle of window
var bars2; // horizontal bars for top twitterer
var max2; // maximum value for these bars, used for D3 scale
var xScale2; //D3 scale
var xAxis2; //x axis

// global variable for ALL_TAGS
var dataset; // loaded complete dataset for a specific month and hashtag
var datasetTopHashtag; //subset for top hashtags
var datasetTopTwitterer; //subset for top twitterer
var datasetTagDisease; // subset of disease-tagged terms
var datasetTagGene; // subset of gene-tagged terms
var datasetTagNone; // subset of untagged terms

var div3; // div for tags on right side of window
var filename;
var var_hashtag;
var var_month;

// size of SVGs
var svgHeight = 450;   // height of whole SVG element
var svgWidth = 300;    // width of whole SVG element
var barPadding = 5;    // Space between horizontal bars
var svgPadding = 20 ; // Outer space of whole SVG element


// ===================================================
// ===================================================
// Functions
// ===================================================
// ===================================================


// Cut original variable into smaller pieces for the D3 visualisation in three different SVGs/DIVs
function generateDataSubsets() {
        datasetTopHashtag = $.grep(dataset, function(e) {return e.type == "top_hashtag"});
        datasetTopTwitterer = $.grep(dataset, function(e) {return e.type == "top_twitterer"});
        datasetTagDisease = $.grep(dataset, function(e) {return (e.type == "tag" && e.flag=="conference")}); // conference = disease!!!!!
        datasetTagGene = $.grep(dataset, function(e) {return (e.type == "tag" && e.flag=="mesh")}); // mesh = gene !!!!!
        datasetTagNone = $.grep(dataset, function(e) {return (e.type == "tag" && e.flag=="none")});
}

// Remove 2 SVGs with bars and 1 DIV of he right-hand subwindow
function removeOldDIVs() {
	$("#all_tags").remove(); //right subwindow
	$("#top_hashtags").remove(); // left subwindow
	$("#top_twitterer").remove(); // middle subwindow
}

// Add 2 SVGs with bars and  1 DIV for left, middle, right subwindow
function generateDIVs() {
	// ********************************************************
	// Part A: Everything for the top hashtags (left subwindow)
	// ********************************************************
	// Step 1: Add SVG for top twitterer on left side
	svg = d3.select("#sidebar").append("svg")
                .attr("width",svgWidth)
                .attr("height",svgHeight+svgPadding)
                .attr("id","top_hashtags"); // add svgPadding to allow space for xAxis at bottom

        // Step 2: Define scale and axis
        var max = d3.max(datasetTopHashtag, function(d) { return +d.count;} );
        var xScale = d3.scale.linear() // scale input values to output "space"
                   .domain([0,max]) // determine the range of input
                   .range([svgPadding,svgWidth-svgPadding]); // use height of SVG for output

        // Define x axis for the top hashtag bars
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5); // numbers on left side, 5 units

        // Step 3: Add the bars within the SVG element
        bars = svg.selectAll("rect") // Add bars to SVG element
                  .data(datasetTopHashtag)
                  .enter()
                  .append("rect");

        // Step 4: Add click events to bars
	bars.on("click", function(d) { window.open("https://twitter.com/search/%23"+d.value); }) // https://twitter.com/search/%23hashtag
            .attr({
	       y: function(d,i){return i * ((svgHeight-svgPadding)/datasetTopHashtag.length)+svgPadding;},  // y coordinate depends on #bars (simpler: i*21)
	       x: svgPadding,
	       height: ((svgHeight-svgPadding)/datasetTopHashtag.length) - barPadding, // Width depends on #bars
	       width: function(d) {return xScale(d.count)-svgPadding;}, // Array determines length of bar
	       fill: "#55acee", // Add Twitter blue for horizontal bars
	       id: function(d){return d.value;} // Add hashtag as ID to the element
             });

	// Step 5: Add text labels to the bars
	svg.selectAll("text")
	    .data(datasetTopHashtag)
	    .enter()
	    .append("text")
	    .text(function(d){return "#"+d.value;})  // assign the value of dataset
	    .on("click", function(d) { window.open("https://twitter.com/search/%23"+d.value+'%20'+var_hashtag); })
	    .attr({
	     y: function(d,i){return i * ((svgHeight-svgPadding)/datasetTopHashtag.length) +svgPadding + 0.5*((svgHeight-svgPadding)/datasetTopHashtag.length);},
	     x: function(d){return svgPadding+10;},
	     fill:"black"
	});

	// Step 6: Add x axis at bottom
	svg.append("g")
	    .attr("transform","translate(0,"+svgHeight+")") // shift to the bootim to see he numbers
	    .attr("class","axis")  // define class to attach CSS defined in header section
	    .call(xAxis); // call axis

	// ***************************************************************
	// Part B: And everything for the top twitterer (middle subwindow)
	// ***************************************************************

	// Step 1: Add an SVG element to the sidebar
        svg2 = d3.select("#sidebar2").append("svg")
                 .attr("width",svgWidth)
                 .attr("height",svgHeight+svgPadding)
                 .attr("id","top_twitterer"); // add svgPadding to allow space for xAxis at bottom

        // Step 2: Add sclae and axis
        var max2 = d3.max(datasetTopTwitterer, function(d) { return +d.count;} );
        var xScale2 = d3.scale.linear() // scale input values to output "space"
                   .domain([0,max2]) // determine the range of input
                   .range([svgPadding,svgWidth-svgPadding]); // use height of SVG for output

        // Define x axis for the top hashtag bars
        var xAxis2 = d3.svg.axis().scale(xScale2).orient("bottom").ticks(5); // numbers on left side, 5 units

        // Step 3: Add the bars within the SVG element
        bars2 = svg2.selectAll("rect") // Add bars to SVG element
	      .data(datasetTopTwitterer)
	      .enter()
	      .append("rect")

	// Step 4: Add click events
	bars2.on("click", function(d) { window.open("https://twitter.com/"+d.value); }) // https://twitter.com/search/%23kittenparty for hashtags
            .attr({
	       y: function(d,i){return i * ((svgHeight-svgPadding)/datasetTopTwitterer.length)+svgPadding;},  // y coordinate depends on #bars (simpler: i*21)
	       x: svgPadding,
	       height: ((svgHeight-svgPadding)/datasetTopTwitterer.length) - barPadding, // Width depends on #bars
	       width: function(d) {return xScale2(d.count)-svgPadding;}, // Array determines length of bar
	       fill: "#55acee", // Add Twitter blue for horizontal bars
	       id: function(d){return d.value;} // Add hashtag as ID to the element
             });

	// Step 5: Add text labels to the bars
	svg2.selectAll("text")
	    .data(datasetTopTwitterer)
	    .enter()
	    .append("text")
	    .text(function(d){return "@"+d.value;})  // assign the value of dataset
	    .on("click", function(d) { window.open("https://twitter.com/"+d.value); })
            .attr({
	       y: function(d,i){return i * ((svgHeight-svgPadding)/datasetTopTwitterer.length) +svgPadding + 0.5*((svgHeight-svgPadding)/datasetTopTwitterer.length);},
	       x: function(d){return svgPadding+10;},
	       fill:"black"
	    });

	// Step 6: Add x axis at bottom
	svg2.append("g")
    	    .attr("transform","translate(0,"+svgHeight+")") // shift to the bootim to see he numbers
	    .attr("class","axis")  // define class to attach CSS defined in header section
	    .call(xAxis2); // call axis

	// ******************************************
	// Part C: And now the tags on the right side
	// ******************************************
	div3 = d3.select("#main_content").append("div")
		  // .attr("width",svgWidth)
		  // .attr("max-height",svgHeight+svgPadding)
		    .attr("id","all_tags");


	if (datasetTagDisease.length == 0) {
		$("#all_tags").append('<a class="disease_class"> No disease terms found!</a>, ');}

	else {
		$.each(datasetTagDisease, function(i, d) {
		$("#all_tags").append('<a class="disease_class" href="https://twitter.com/search?q=' +var_hashtag+'%20'+d.value+'" target="_blank">' + d.value + "</a>, ");
		});
	}
	// add background color to disease tags
	$(".disease_class").css("background-color","orange");

	if (datasetTagGene.length == 0) {
		$("#all_tags").append('<a class="gene_class">No gene terms found!</a>, ');}
	else {
		$.each(datasetTagGene, function(i, d) {
		$("#all_tags").append('<a class="gene_class" href="https://twitter.com/search?q=' +var_hashtag+'%20'+d.value+'" target="_blank">' + d.value + "</a>, ");
		});
	}
	// add background color to gene tags
	$(".gene_class").css("background-color","lightgreen");

	$.each(datasetTagNone, function(i, d) {
	    $("#all_tags").append('<a class="none_class" href="https://twitter.com/search?q=' +var_hashtag+'%20'+d.value+'" target="_blank">' + d.value + "</a>, ");
	});
} // end of function generateDIVs()

// generate warning if file is not avilabel
function generateWarningMessage() {
	div3 = d3.select("#main_content")
		 .append("div")
	         .attr("id","all_tags");
	$("#all_tags").append('<a class="disease_class">The analysis for this month is not available!</a>');

	svg = d3.select("#sidebar").append("div")
                .attr("width",svgWidth)
                .attr("height",svgHeight+svgPadding)
                .attr("id","top_hashtags"); // add svgPadding to allow space for xAxis at bottom
	$("#top_hashtags").append('<a class="disease_class">The analysis for this month is not available!</a>');

	svg2 = d3.select("#sidebar2").append("div")
                 .attr("width",svgWidth)
                 .attr("height",svgHeight+svgPadding)
                 .attr("id","top_twitterer"); // add svgPadding to allow space for xAxis at bottom
	$("#top_twitterer").append('<a class="disease_class">The analysis for this month is not available!</a>');

	$("#all_tags, #top_twitterer, #top_hashtags").css({
		color: "orange",
		"font-weight": "bold",
		"text-align": "center"});
} // end of function generateWarningMessage

// ===================================================
// ===================================================
// First generation of page
// ===================================================
// ===================================================
$(document).ready(function() {
 	// Find checked buttons
 	$(".radio_month:checked").each(function () {
    		var_month = $(this).attr("id");

    	});
    	$(".radio_hashtag:checked").each(function () {
    		var_hashtag = $(this).attr("id");
    	});

	// Generate file name for d3.csv function
	filename = "data/"+var_hashtag+"-"+var_month+".csv";
	d3.csv(filename, function (data) {
		dataset=data;
		generateDataSubsets();
		generateDIVs();
	}); // end d3.csv function
  }); // end ready function

// ====================================================
// ====================================================
// UPDATES based on click events in the upper menu
// ====================================================
// ====================================================
$(".radio_hashtag, .radio_month").click(function(event) {
 	//Get ID from clicked hashtag
    	//var var_hashtag; //= $(this).attr("id");
    	//var var_month;

    	//Get ID from checked month
    	$(".radio_month:checked").each(function () {
    		var_month = $(this).attr("id");
    	});
    	$(".radio_hashtag:checked").each(function () {
    		var_hashtag = $(this).attr("id");
    	});

	// Generate file name for d3.csv function
	filename = "data/"+var_hashtag+"-"+var_month+".csv";

	d3.csv(filename,function(error,data) {
		if (error) { // if file does not exist
			removeOldDIVs();
			generateWarningMessage();
		} else {
//	d3.csv(filename, function (data) {
		dataset=data;
		generateDataSubsets();
		removeOldDIVs();
		generateDIVs();
		} // end if-then-else
	}); // end d3.csv function
}); // end click event on button

