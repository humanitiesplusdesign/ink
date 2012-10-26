$("#loading").hide()

$("#loading").ajaxStart(function(){
   $(this).slideDown();
   $("#page").fadeTo('fast',.2)
 });

$("#loading").ajaxStop(function(){
   $(this).slideUp();
   $("#page").fadeTo('fast',1)
 });

var color = d3.scale.category20(),
	map = ink.vis.map()
		.on("linkclick",function(d){
			
			q = {};
			q.start = query.start;
			q.end = query.end;
			q.s = d.source;
			q.d = d.target;
			
			getLetters(q,function(a){
				console.log(JSON.parse(a));
			})
		})
		.on("nodeclick",function(d){
			
			var q = {}
			q.start = query.start;
			q.end = query.end;
			q.s = d;
			
			var all = []
			
			getLetters(q,function(a){
				all = JSON.parse(a);
				
				var q2 = {}
				q2.start = query.start;
				q2.end = query.end;
				q2.d = d;

				getLetters(q2,function(b){
					all.push.apply(all, JSON.parse(b))
					showLetters(all)
				})
			})
			
		})
		.on("linkclick", function(d){
			var q = {}
			q.start = query.start;
			q.end = query.end;
			q.s = d.source;
			q.d = d.target;
			
			getLetters(q,function(a){
				showLetters(JSON.parse(a))
			})
		}),
	timestack = ink.vis.timestack()
		.color(color)
		.on("nodeclick", function(d){
			
			var q = {}
			q.start = d.x.getFullYear();
			q.end = d.x.getFullYear();
			q[timestack.dimension()] = d.d
									
			getLetters(q,function(a){
				showLetters(JSON.parse(a));
			})
			
		})
		.on("labelclick", function(d){
			
			var q = {}
			q.start = d.getFullYear();
			q.end = d.getFullYear();
									
			getLetters(q,function(a){
				showLetters(JSON.parse(a));
			})
			
		}),
	sankey = ink.vis.sankey()
		.on("groupclick",function(d){
			dimension=d.key; timestack.dimension(dimension).update(); 
			
			// Font
			sankey.vis().selectAll(".grouplabel")
				.style("font-weight", "normal")
			sankey.vis().select(".grouplabel." + d.key.split(' ').join('-'))
				.style("font-weight", "bold")
			
			
			// Colors
			sankey.vis().selectAll(".node")
				.style("fill", "#000")
			sankey.vis().select(".group." + d.key.split(' ').join('-'))
				.selectAll(".node")
			 	.style("fill", function(a){
					return color(timestack.order()[a.name]);
			})
			
			
			// Labels
			sankey.vis().selectAll(".nodelabel")
				.attr("opacity",0)
				.style("font-weight", "normal")
			sankey.vis().selectAll(".nodelabel." + d.key.split(' ').join('-'))
				.attr("opacity", function(a){ return a.index <= 5 ? 1 : 0; })
			
			})
		.on("nodeclick",function(d){
			dimension = d.group;
			timestack.dimension(dimension).update();
			timestack.highlight(d.name)
			
			node = {}
			node[dimension] = d.name;
			
			// Font
			sankey.vis().selectAll(".grouplabel")
				.style("font-weight", "normal")
			sankey.vis().select(".grouplabel." + d.group.split(' ').join('-'))
				.style("font-weight", "bold")
			
			// Colors
			sankey.vis().selectAll(".node")
				.style("fill", "#000")
			sankey.vis().select(".group." + d.group.split(' ').join('-'))
				.selectAll(".node")
			 	.style("fill", function(a){
					return color(timestack.order()[a.name]);
			})
			
			// Labels
			sankey.vis().selectAll(".nodelabel")
				.attr("opacity",0)
				.style("font-weight", "normal")
			sankey.vis().selectAll(".nodelabel." + d.group.split(' ').join('-'))
				.attr("opacity", function(a){ return a.index <= 5 ? 1 : 0; })
			sankey.vis().selectAll(".nodelabel." + d.name.split(' ').join('-'))
				.attr("opacity", 1)
				.style("font-weight", "bold")
			

			})
		.on("nodeover", function(d){
			sankey.highlight(d.name)
			
		})
		.on("nodeout", function(r){
			
			d = dimension;
			
			// Font
			sankey.vis().selectAll(".grouplabel")
				.style("font-weight", "normal")
			sankey.vis().select(".grouplabel." + d.split(' ').join('-'))
				.style("font-weight", "bold")
			
			
			// Colors
			sankey.vis().selectAll(".node")
				.style("fill", "#000")
			sankey.vis().select(".group." + d.split(' ').join('-'))
				.selectAll(".node")
			 	.style("fill", function(a){
					return color(timestack.order()[a.name]);
			})
			
			
			// Labels
			sankey.vis().selectAll(".nodelabel")
				.attr("opacity",0)
				.style("font-weight", function(d){ if(d.group==dimension && d.name == node[dimension]){ return "bold" } else return "normal"; })
			sankey.vis().selectAll(".nodelabel." + d.split(' ').join('-'))
				.attr("opacity", function(a){ return a.index <= 5 ? 1 : 0; })
				
				
			sankey.highlight()
		}),
	dimension = 'p',
	query = {
		start : "",
		end : "",
		s : "",
		d : "",
		g : "",
		n : "",
		m : ""
	},
	dictionary = {
		g : "Gender",
		n : "Nationality",
		m : "Milieu",
		s : "Source",
		d : "Destination",
		a : "Author",
		r : "Recipient",
		t : "Date",
		id : "Id"
	},
	width = parseInt(d3.select("#page").style("width")),
	on = "letters",
	node = {}
	
	


d3.select("#send").on("click",function(){
		
	query.start = d3.select("#start").property("value")
	query.end = d3.select("#end").property("value")
	query.on = $("select option:selected").attr("value")
	
	query.action = "time"
	
	$.ajax({
		url : 'api/',
		data : query,
		success : updateTimestack,
		complete: function(){
			query.action = "sankey"

			$.ajax({
				url : 'api/',
				data : query,
				success : updateSankey,
				complete : function(){
					query.action = "geo"

					$.ajax({
						url : 'api/',
						data : query,
						success : updateMap,
					})
				}
			})
		}
	})

})


function getLetters(q, callback){
	q.action = "letters"
	$.ajax({
		url : 'api/',
		data : q,
		success : callback
	})
	
}

function updateSankey(result) {

	data = JSON.parse(result);

	sankey
		.data(data)
		.target("#sankey")
		.width(width)
		.height(400)
		.sequence(["g","n","m"])
		.dictionary(dictionary)
		.order(timestack.order())
		.update()
	
	
}

function updateTimestack(result) {

	data = JSON.parse(result);

	timestack
		.data(data)
		.dimension(dimension)
		.target("#timeline")
		.width(width)
		.height(150)
		.update()
}

function updateMap(result) {

	data = JSON.parse(result);
	
	map
		.target("#map")
		.width(width)
		.height(600)
		.data(data)
		.update()
	
	d3.select("#mapinfo")
		.remove()
	
	d3.select("#map")
		.append("div")
		.attr("id","mapinfo")
		.append("p")
			.attr("class","grouplabel")
			.html(function(d){ return "Plottable: " + data.info.yes + " Not plottable: " + data.info.no; })
			.on("click",function(d){
				dimension='p'; timestack.dimension(dimension).update();
								
				sankey.vis().selectAll(".grouplabel")
					.style("font-weight", "normal")
				sankey.vis().selectAll(".node")
					.style("fill", "#000")
				sankey.vis().selectAll(".nodelabel")
					.attr("opacity",0)
					.style("font-weight", "normal")
			})

	
}


function showLetters(letters) {	
	
	
	d3.select("#sheet")
		.select('div')
		.remove()

	var closeButton = d3.select("#sheet")
	.append("a")
	.attr("class","close")
	.html("Close")
	.on("click", function() {
		$.closeDOMWindow({ anchoredClassName:'letters-window' });
	})

	var table = d3.select("#sheet")
	.append("table")
	.attr("id","letters")
	.style("display","inline-table")

	var tr = table
		.append("thead")
		.append("tr")

	var keys = letters.map(function(s){ return d3.keys(s) })
	var maxKeys = []

	for (var i=0; i<keys.length; i++) {
		if (keys[i].length > maxKeys.length)
			maxKeys = keys[i]
	}

	for (i in maxKeys)
		tr.append("th").html(dictionary[maxKeys[i]]);

/*	lettersArray = [letters.map(function(d){ return d3.values(d); })]
	d3.select("#sheet")
		.selectAll("p.export")
		.data([letters])
		.enter().append("p")
		.attr("class","export")
		.text("Download as .csv")
		.on("click",function(d){
				
				$.ajax({
					url : 'api/export.php',
					type: 'POST',
					data : { exportdata : JSON.stringify(d) },
					success : function(r){ console.log(r);},
				})
			
		})
	*/
	var w = width-20;
	
	$(table[0][0]).dataTable( {
		"aaData": objectToArray(letters),
		"bProcessing": true,
		"bAutoWidth": true,
		"bJQueryUI": false,
		"iDisplayLength": 25,
		"aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
		"sPaginationType": "full_numbers",

	} );

	d3.selectAll(".letters-window")
		.remove()

	$.openDOMWindow({ 
		positionType:'anchored', 
		anchoredClassName:'letters-window', 
		anchoredSelector:'#page', 
		draggable:0,
		overlay:1,
		positionLeft:0,
		width: w,
		height: "",
		positionTop: 20,
		windowSourceID:'#sheet' 
	});



}

function objectToArray(object) {
	
	var array = new Array();
	
	for (var i in object) {
		array.push(d3.values(object[i]))
	}
	
	return array;
	
}

function jsonKeyValueToArray(k, v) {return [k, v];}

function jsonToArray(json) {
    var ret = new Array();
    var key;
    for (key in json) {
        if (json.hasOwnProperty(key)) {
            ret.push(jsonKeyValueToArray(key, json[key]));
        }
    }
    return ret;
};

