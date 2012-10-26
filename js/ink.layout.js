(function(){
	
	ink.layout = {};
	
	ink.layout.sankey = function(){
		
		var sankey = {},
			nodes,
			links,
			groups,
			flows,
			sequence,
			sortSubGroups;
					
		
		function relayout() {
			
			var subgroups = [];
			
			groups = [];
			flows = [];
			
			// initialize subgroups
			nodes.forEach(function(d){
				var n = {};
				n.name = d.name;
				n.group = d.group;
				n.in = 0;
				n.out = 0;
				subgroups.push(n)
			})

			links.forEach(function(d,i){
				
				var f = {};
				f.source = subgroups[d.source]
				f.target = subgroups[d.target]
				f.source.in += d.value;
				f.target.out += d.value;
				f.value = d.value;
				flows.push(f)
				
				// automatically retrieving sequence from links
				if (!sequence) sequence = [f.source.group];
				if (f.source.group != sequence[sequence.length-1]) sequence.push(f.source.group);
				if (i == links.length-1) sequence.push(f.target.group);
			})
						
			groups = d3.nest()
				.key(function(d){ return d.group; })
				.rollup(function(d){
					var n = d,
						value = 0,
						ins = 0,
						outs = 0;
						
					n.forEach(function(o){
						ins += o.in;
						outs += o.out;
					})
					return { "nodes" : n, "value" : d3.max([ins,outs]), "last" : 0 }; 
				})
				.map(subgroups)
			
			
			
			// sorting groups
			if (sortSubgroups) {
				for (var i in groups){
					d = groups[i];
					d.nodes.sort(function(a,b){
						return sortSubgroups(d3.max([a.in, a.out]), d3.max([b.in, b.out]))
					})
				}
			}
			
			for (var i in groups) {
				d = groups[i]
				d.index = sequence.indexOf(i)
				d.nodes.forEach(function(n,index){
					var last = d.last;
					d.last += d3.max([n.in,n.out]);
					n.offset = last;
					n.index = index;
					n.groupIndex = d.index;
					n.lastIn = 0;
					n.lastOut = 0;
				})
			}
			
			// sorting flows
			flows.sort(sortFlows)
			
		}
		
		
		function sortFlows(a,b) {
				
			var o1 = a.target.index;
			var o2 = b.target.index;

			var p1 = a.source.index;
			var p2 = b.source.index;

			if (o1 != o2) {
				if (o1 < o2) return -1;
				if (o1 > o2) return 1;
				return 0;
			}
			if (p1 < p2) return -1;
			if (p1 > p2) return 1;
			return 0;
		}
		
		
		
		sankey.nodes = function(x) {
			if (!arguments.length) return nodes;
			nodes = x;
			groups = flows = null;
			return sankey;
		}

		sankey.links = function(x) {
			if (!arguments.length) return links;
			links = x;
			groups = flows = null;
			return sankey;
		}

		sankey.sequence = function() {
			if (!sequence) relayout();
			return sequence;
		}

		sankey.groups = function() {
			if (!groups) relayout();
			return groups;
		}

		sankey.flows = function() {
			if (!flows) relayout();
			return flows;
		}
		
		sankey.maxValue = function() {
			if (!groups) return;
			return d3.max(d3.entries(groups).map(function(d){ return d.value.value; }))
		}
		
		sankey.maxNumNodes = function() {
			if (!groups) return;
			return d3.max(d3.entries(groups).map(function(d){ return d.value.nodes.length; }))
		}
		
		sankey.sortSubgroups = function(x) {
	    	if (!arguments.length) return sortSubgroups;
	    	sortSubgroups = x;
	    	flows = null;
	    	return sankey;
	  	};
	
			
		return sankey;
	}
	
})()