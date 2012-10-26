(function(){
	
	ink.vis = {};
	
	ink.vis.sankey = function(){
		
		var sankey = {},
			event = d3.dispatch(
				"groupclick",
				"nodeclick",
				"nodeover",
				"nodeout"
			),
			data,
			net,
			sequence,
			layout,
			target,
			scale,
			step,
			vis,
			width,
			height,
			np = 2,
			p = 10,
			align = "middle",
			line = d3.svg.line()
				.interpolate('bundle')
				.tension(1),
			dictionary,
			color = d3.scale.category20(),
			order
			
				
		function curve(item) {
			var sourcey = scale(item.source.offset) + np * item.source.index + scale(item.value)/2 + item.source.lastOut
			if (align == "middle") sourcey += 30 + ( height - 30 - 2*p - ( scale(layout.groups()[item.source.group].value) + np*(layout.groups()[item.source.group].nodes.length-2)) )/2
			var targety = scale(item.target.offset) + np * item.target.index + scale(item.value)/2 + item.target.lastIn
			if (align == "middle") targety += 30 + ( height - 30 - 2*p - ( scale(layout.groups()[item.target.group].value) + np*(layout.groups()[item.target.group].nodes.length-2)) )/2

			item.source.lastOut += scale(item.value);
			item.target.lastIn += scale(item.value);
	
			var points = [
				[ item.source.groupIndex * step + p, sourcey ],
				[ item.source.groupIndex * step + p + step/4, sourcey ],
				[ item.target.groupIndex * step + p - step/4, targety ],
				[ item.target.groupIndex * step + p, targety ]
			]
		
			return line(points)
		}
		
		sankey.data = function(x) {
			if(!arguments.length) return data;
			data = x;
			return sankey;
		}

		sankey.vis = function() {
			if(!vis) sankey.update();
			return vis;
		}
		
		sankey.color = function(x) {
			if(!arguments.length) return color;
			color = x;
			return sankey;
		}
		
		sankey.order = function(x) {
			if(!arguments.length) return order;
			order = x;
			return sankey;
		}
		
		sankey.sequence = function(x) {
			if(!arguments.length) return sequence;
			sequence = x;
			return sankey;
		}
		
		sankey.dictionary = function(x) {
			if(!arguments.length) return dictionary;
			dictionary = x;
			return sankey;
		}

		sankey.align = function(x) {
			if(!arguments.length) return align;
			align = x;
			return sankey;
		}

		sankey.target = function(x) {
			if(!arguments.length) return target;
			target = x;
			return sankey;
		}

		sankey.width = function(x) {
			if(!arguments.length) return width;
			width = x;
			return sankey;
		}

		sankey.height = function(x) {
			if(!arguments.length) return height;
			height = x;
			return sankey;
		}
		
		sankey.on = function(type, listener) {
			event[type].add(listener)
			return sankey;
		}
		
		sankey.highlight = function(link){
			
			if (!arguments.length) {
				vis.selectAll(".link")
					.attr("opacity", 1)
				//vis.selectAll(".nodelabel")
				//	.attr("opacity", 0)
				return sankey;
			}
			var link2 = link
			//check for spaces...
			link = link.split(' ').join('-').replace("?","\\?").replace("/","\\/")
			
			vis.selectAll(".link")
				.attr("opacity", .1)
			vis.selectAll(".link."+link)
				.attr("opacity", 1)
			
			//vis.selectAll(".nodelabel")
			//	.attr("opacity", 0)
			vis.selectAll(".nodelabel."+link)
				.attr("opacity", 1)
				
			console.log(vis.select(".nodelabel."+"I"))
			
			for (var f=0; f< layout.flows().length; f++) {
				var flow = layout.flows()[f]
								
				if (flow.source.name == link2){
					console.log(flow.source.name.split(' ').join('-'))
					
					vis.select(".nodelabel."+flow.target.name.split(' ').join('-').replace("?","\\?").replace("/","\\/"))
						.attr("opacity", 1)
				}	
					
				if (flow.target.name == link2) {
					console.log(flow.source.name.split(' ').join('-'))
					vis.select(".nodelabel."+flow.source.name.split(' ').join('-').replace("?","\\?").replace("/","\\/"))
						.attr("opacity", 1)
				}
				
			}
				
			return sankey;
		}
		
		sankey.update = function() {
			
			if (!sequence) sequence = d3.keys(data[0]);
			net = ink.net(data, sequence);
			
			layout = ink.layout.sankey()
				.nodes(net.nodes)
				.links(net.links)
				.sortSubgroups(d3.descending)
			
			var w = width, 	// width
				h = height,	// height
				nw = 10,	// nodes width
				fill = d3.scale.category20();
						
			step = (w - p*2 - nw) / (layout.sequence().length-1),
			scale = d3.scale.linear().domain([0, layout.maxValue()]).range([0, h - 2 * p - (layout.maxNumNodes()-1) * np - 30 ])

			d3.select(target).selectAll("svg").remove()
			
			vis = d3.select(target)
						.append("svg:svg")
						.attr("height", h)
						.attr("width", w)

			var link = vis.append("svg:g")
				.attr("class","links")
				.selectAll("path.link")
				.data(layout.flows())
				.enter().append("svg:path")
					.attr("class", function(d){return "link " + d.source.name.split(' ').join('-') + " " + d.target.name.split(' ').join('-');})
					.style('stroke-width', function(d) { return scale(d.value) })
					.style("stroke", "#999")
					.attr("d", curve)

			var group = vis.selectAll("g.group")
				.data(d3.entries(layout.groups()))
				.enter().append("svg:g")
				.attr("class", function(d){ return "group " + d.key.split(' ').join('-'); })
				.attr("id", function(d){ return d.key; })

			var node = group.selectAll("rect")
				.data(function(d){ return d.value.nodes })
				.enter().append("svg:rect")
					.attr("class", function(d){ return "node " + d.name.split(' ').join('-'); })
					.attr("width", nw)
					.attr("height", function(d){ return scale(d3.max([d.in, d.out])) })
					.attr("x", function(d){ return d.groupIndex * step + p; })
					.attr("y",function(d){ return align == "middle" ?  30 + scale(d.offset) + np*d.index + ( h - 30 -2*p - ( scale(layout.groups()[d.group].value) + np*(layout.groups()[d.group].nodes.length-2)) )/2 : 30 + scale(d.offset) + np*d.index; })
					.style("fill", "#000")
					.on("click",function(d){ event.nodeclick.dispatch(d) })
					.on("mouseover",function(d){ event.nodeover.dispatch(d) })
					.on("mouseout",function(d){ event.nodeout.dispatch(d) })
					.attr("cursor","pointer")
					
			node.append("svg:title")
				.text(function(d) { return d.name +  " (" + (d3.max([d.in, d.out])/(layout.groups()[d.group].value)*100).toFixed(2) + "%)"; })
			
			var label = group.selectAll("text")
				.data(function(d){ return d.value.nodes })
				.enter().append("svg:text")
					.attr("class",function(d){ return "nodelabel " + d.group.split(' ').join('-') + " " + d.name.split(' ').join('-'); })
					.attr("dx", function(d){ return d.groupIndex < sequence.length-1 ? d.groupIndex * step + p + nw + 5 : d.groupIndex * step + p - 5 ; })
					.attr("dy",function(d){ return align == "middle" ?  30 + scale(d.offset+d3.max([d.in,d.out])/2) + np*d.index + ( h - 30 -2*p - ( scale(layout.groups()[d.group].value) + np*(layout.groups()[d.group].nodes.length-2)) )/2 : 30 + scale(d.offset) + np*d.index; })
					.attr("text-anchor",function(d){ return d.groupIndex < sequence.length-1 ? "start" : "end" })
					.attr("alignment-baseline","middle")
					.attr("opacity",0)
					.text(function(d){ return d.name; })
						
			
			
			group.append("svg:text")
				.attr("class",function(d){ return "grouplabel " + d.key.split(' ').join('-'); })
				.attr("dx", function(d){ return d.value.index * step + p + nw/2; })
				.attr("dy", 20)
				.attr("text-anchor", function(d){
					var anchor = "middle"
					if (d.value.index == 0)
						anchor = "start"
					if (d.value.index == sequence.length-1)
						anchor = "end"
					return anchor;
				})
				.text(function(d) { return dictionary ? dictionary[d.key] : d.key; })
				.on("click",function(d){ event.groupclick.dispatch(d) })
			
			return sankey;
				
		}
		
		return sankey;
	}
	
	
	ink.vis.timestack = function(){
		
		var timestack = {},
			event = d3.dispatch(
				"nodeclick",
				"labelclick"
			),
			data,
			target,
			stack,
			dimension,
			width,
			height,
			vis,
			color = d3.scale.category20(),
			parse = d3.time.format("%Y").parse,
			order
		   
		
		timestack.width = function(x) {
			if(!arguments.length) return width;
			width = x;
			return timestack;
		}

		timestack.height = function(x) {
			if(!arguments.length) return height;
			height = x;
			return timestack;
		}
		
		timestack.data = function(x) {
			if(!arguments.length) return data;
			data = x;
			return timestack;
		}
		
		timestack.color = function(x) {
			if(!arguments.length) return color;
			color = x;
			return timestack;
		}

		timestack.order = function() {
			return order;
		}
		
		// TODO se il target è oggetto convertire nel nome...
		timestack.target = function(x) {
			if(!arguments.length) return target;
			target = x;
			return timestack;
		}
		
		timestack.dimension = function(x) {
			if(!arguments.length) return dimension;
			dimension = x;
			return timestack;
		}
		
		timestack.highlight = function(node){
			//check for spaces...
			node = node.split(' ').join('-')
			
			vis.selectAll(".node")
				.attr("opacity", .1)
			vis.selectAll(".node."+node)
				.attr("opacity", 1)
		}
		
		timestack.on = function(type, listener) {
			event[type].add(listener)
			return timestack;
		}
		
		timestack.update = function(){
			
			stack = ink.stack(data.years, data.values, parse);
			
			var w = width,
			    h = height,
			    p = [20, 50, 30, 20],
			    x = d3.scale.ordinal().rangeRoundBands([0, w - p[1] - p[3]]),
				xl = d3.scale.linear().range([0, w - p[1] - p[3]]),
			    y = d3.scale.linear().range([0, h - p[0] - p[2]]),
			    format = d3.time.format("%Y");

			d3.select(target).selectAll("svg").remove()

			vis = d3.select(target).append("svg:svg")
			    .attr("width", w)
			    .attr("height", h)
			  .append("svg:g")
			    .attr("transform", "translate(" + p[3] + "," + (h - p[2]) + ")");
			
			vis.append("svg:rect")
				.attr("width", w)
				.attr("height",h)
				.attr("fill","#fff")
				.attr("fill-opacity",0)
				.attr("transform", "translate(0," + -h + ")");
			    
			
			
			// Compute the x-domain (by date) and y-domain (by top).
			x.domain(stack[dimension][0].map(function(d) { return d.x; }));
			y.domain([0, d3.max(stack[dimension][stack[dimension].length - 1], function(d) { return d.y0 + d.y; })]);

			var inv = d3.scale.linear().domain([0, w - p[1] - p[3]]).range(stack[dimension][0].map(function(d) { return d.x; }))
			// Add a group for each cause.
			
			
			
			var no = false
			
			order = {}
			var cause = vis.selectAll("g.cause")
		      .data(function(){
					if (dimension == 'p' && !no){
						stack[dimension].push(stack[dimension].shift());
						stack[dimension] = d3.layout.stack()(stack[dimension])
						no = true
					}
					return stack[dimension]
			})
		    .enter().append("svg:g")
		      .attr("class", "cause")
		      .style("fill", function(d, i) {
				order[d[0].d] = i;
				
				if (dimension == 'p') {
					return d3.scale.ordinal().domain([0,1]).range(["#333","#ddd"])(i)
				}
				else return color(i);
				})
		      .style("stroke", function(d, i) { return d3.rgb(color(i)).darker(); });
		
		  // Add a rect for each date.
		  var rect = cause.selectAll("rect")
		      .data(Object)
		    .enter().append("svg:rect")
			  .attr("class", function(d){ return "node " + d.d.split(' ').join('-'); })
		      .attr("x", function(d) { return x(d.x); })
		      .attr("y", function(d,i) {
					return -y(d.y0) - y(d.y);
				})
		      .attr("height", function(d) { return y(d.y); })
		      .attr("width", x.rangeBand()-2)
			  .on("click", function(d){ event.nodeclick.dispatch(d); })
			rect.append("svg:title")
				.text(function(d,i) { return d.d + " (" + (d.y/stack['c'][0][i].y*100).toFixed(2) + "%)"; });

		  // Add a label per date.
		  var label = vis.selectAll("text")
		      .data(x.domain().filter(function(d){ return d.getFullYear() % 10 == 0 || x.domain().length <= 21; }))
		    .enter().append("svg:text")
			  .attr("class","label timelabel")
		      .attr("x", function(d) { return x(d) + x.rangeBand() / 2 -1; })
		      .attr("y", 6)
		      .attr("text-anchor", "middle")
		      .attr("dy", ".71em")
			  .on("click",function(d){ event.labelclick.dispatch(d)})
		      .text(format);

		  // Add y-axis rules.
		  var rule = vis.selectAll("g.rule")
		      .data(y.ticks(5))
		    .enter().append("svg:g")
		      .attr("class", "rule")
		      .attr("transform", function(d) { return "translate(0," + -Math.round(y(d)) + ")"; });

		  rule.append("svg:line")
		      .attr("x2", w - p[1] - p[3])
		//	  .attr("x1", function(d) { return d ? 0: 0; })
		      .style("stroke", function(d) { return d ? "#000" : "#000"; })
		      .style("stroke-opacity", function(d) { return d ? 0 : .5; })
			  .style("stroke-width", function(d) { return d ? 1 : 1; });
		
	/*	  rule.append("svg:text")
			  .attr("class","label")
		      .attr("x", w - p[1] - p[3] + 6)
		      .attr("dy", ".35em")
		      .text(d3.format(",d"));
			
			var mouseTarget;
			
			var bars = vis.append("svg:g")
				.attr("class","bars")
//-				.attr("transform", function(d) { return "translate(0,-50)"; });
			
			bars.append("svg:line")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", 0)
				.attr("y2",- h + p[2])
				.style("stroke","#000")
				.style("stroke-opacity",1)
				.style("stroke-width",4)
				.on("mousedown",function(d){
					d3.event.preventDefault();
									
					mouseTarget = this;	
					vis.on("mousemove",function(m){
						console.log(m, d3.svg.mouse(mouseTarget))
						var barx = d3.svg.mouse(mouseTarget)[0],
							bary = d3.svg.mouse(mouseTarget)[1]
						d3.select(mouseTarget)
							.attr("x1",barx)
							.attr("x2",barx)
						
					})
					vis.on("mouseup", function(d){
						vis.on("mousemove", function(){ })
						console.log(inv(d3.select(d3.event.target).attr("x1")))
					})
				})
				
				
			*/
			
			
			
			return timestack;
			
		}
		
		return timestack;
	}
	
	
	
	ink.vis.map = function(){
		
		var map = {},
			event = d3.dispatch(
				"linkclick",
				"nodeclick"
			),
			target,
			data,
			width,
			height,
			vis,
			po = org.polymaps,
			cloudmadeURL = "http://tile.cloudmade.com/1a1b06b230af4efdbb989ea99e9841af/20760/256/{Z}/{X}/{Y}.png",
			line = d3.svg.line()
				.interpolate('bundle')		
		
		map.width = function(x) {
			if(!arguments.length) return width;
			width = x;
			return map;
		}

		map.data = function(x) {
			if(!arguments.length) return data;
			data = x;
			return map;
		}

		map.height = function(x) {
			if(!arguments.length) return height;
			height = x;
			return map;
		}
		
		map.target = function(x) {
			if(!arguments.length) return target;
			target = x;
			return map;
		}		
		
		map.on = function(type, listener) {
			event[type].add(listener)
			return map;
		}
		
		map.update = function(){
			
			d3.select(target).selectAll("svg").remove()
			
			vis = d3.select(target)
				.append("svg:svg")
				.attr("width", width)
				.attr("height",height)
			
			var s = d3.scale.linear().domain([1,d3.max(data.links.map(function(d){return d.value}))]).range([2,20])
			
			var m = po.map()
				.container(vis.node())
				.center( { 
					lat: 48.856667,
					lon: 2.350833 
				})
				.add(po.drag())
				.add(po.wheel())
				.add(po.image().url(po.url(cloudmadeURL)))
				.zoom(4)
				
							
			var nodes = po.geoJson()
				.features( ink.geo(data.nodes).features )
				.on("load", load)
				.clip(false)
			
			m.add(nodes)
			 .add(po.compass().pan("none"))
			
			
			function load(e){
				
				// Update links				
				data.links.forEach(function(d){
					
					source = e.features[d.source]
					target = e.features[d.target]
										
					var sourcex = source.data.geometry.coordinates.x,
						sourcey = source.data.geometry.coordinates.y,
						targetx = target.data.geometry.coordinates.x,
						targety = target.data.geometry.coordinates.y,
						path = source.element.parentNode.appendChild(po.svg("path"))
						
					var rad = Math.sqrt( Math.pow(targetx-sourcex,2) + Math.pow(targety-sourcey,2) )/4,
						sourceP = Math.atan2((targety-sourcey),(targetx-sourcex)) - Math.PI/10,
						targetP = Math.atan2((sourcey-targety),(sourcex-targetx)) + Math.PI/10
												
						path.setAttribute("d", line([
							[sourcex,sourcey],
							[sourcex+rad*Math.cos(sourceP),sourcey+rad*Math.sin(sourceP)],
							[targetx+rad*Math.cos(targetP),targety+rad*Math.sin(targetP)],
							[targetx,targety]
						]))
						
						d3.select(path)
							.attr("class","geolink")
							.style("stroke-width", function(){ return s(d.value); })
							.style("stroke-opacity", .3)
							.style("stroke", "#000")
							.style("stroke-linecap", "round")
							.style("fill", "none")
							.on("mouseover", function(a){ d3.select(this).style("stroke-opacity",".8") })
							.on("mouseout", function(a){ d3.select(this).style("stroke-opacity",".3") })
							.on("click",function(a){
								event.linkclick.dispatch({
									source:e.features[d.source].data.properties.name,
									target:e.features[d.target].data.properties.name,
									value:d.value})
								})
							.append("svg:title")
								.text(function(){ return source.data.properties.label + " » " + target.data.properties.label + " (" + d.value + ")"; })
						
						if (!source.hasOwnProperty("links"))
							source.links = []
						source.links.push(path)
					
						if (!target.hasOwnProperty("links"))
							target.links = []
						target.links.push(path)
				})
				
				
				e.features.forEach(function(d){
					var node = d3.select(d.element)
						.style("fill","#fff")
						.style("stroke","#000")
						.style("stroke-opacity", .5)
						.style("fill-opacity",.8)
						.on("mouseover", function(a){
							d3.select(this)
								.style("fill-opacity","1")
							
							vis.selectAll(".geolink")
								.attr("opacity", .1)
							
							if (d.links)
								d.links.forEach(function(l){
									d3.select(l)
										.attr("opacity",1)
								
							}) 
						})
						.on("mouseout", function(a){
							d3.select(this)
								.style("fill-opacity",".8")
							
							vis.selectAll(".geolink")
								.attr("opacity", 1)
						})
						.on("click",function(){
							event.nodeclick.dispatch(d.data.properties.name);
						})
					
					node.append("svg:title")
						.text(function(a){ return d.data.properties.label + " (" + d.data.properties.value + ")"; })
					
					// trick per metterlo sopra...
					node.node().parentNode.appendChild(node.node())
					
				})
				
				
			}
			
		}
		
		return map;
	}
	
	
	
	
	
})()