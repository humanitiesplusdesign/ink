(function(){
	
	ink = {};
	
	function getNodeIndex(array, name, group) {
		for (var i in array){		
			var a = array[i]
			if (a['name'] == name && a['group'] == group) {
				return i;
			}
		}
		return -1;
	}
	
	// Convert array of objects in nodes and links according to a sequence
	ink.net = function(array, sequence){
		var n = [],
			l = [],
			d = {};
		if (arguments.length === 1) {
			var sequence = d3.keys(array[0]);
		}
		for (var i=0; i < sequence.length-1; i++ ) {
			var sg = sequence[i]
			var tg = sequence[i+1]
			var relations = d3.nest()
						 .key(function(d) { return d[sg] } )
						 .key(function(d) { return d[tg] } )
						 .entries(array)

			relations.forEach(function(s){

				si = getNodeIndex(n, s.key, sg)
				if ( si == -1) {
					n.push({ "name" : s.key,"group" : sg })
					si = n.length-1;
				}

				s.values.forEach(function(t){
					ti = getNodeIndex(n, t.key, tg)
					if (ti == -1) {
						n.push({ "name" : t.key, "group" : tg })
						ti = n.length-1;
					}
					l.push({ "source" : parseInt(si), "target" : parseInt(ti), "value": t.values.length })
				})
			})
		}
		
		d.nodes = n;
		d.links = l;
		
		return d			
	}
	
	
	ink.stack = function(array, values, parse){
		
		var p = d3.keys(values).map(function(f){
			var o = {}
			o.name = f
			o.val = d3.layout.stack()(
				values[f].map(function(d){
					return d3.entries(array).map(function(single){
						if (!single.value[f].hasOwnProperty(d))
							var v = 0
						else var v = single.value[f][d];
						return { x: parse(single.key), y: v, d: d}
					})
				})
			)
			return o;
		})
	
		var properties = {}
		p.forEach(function(d){
			properties[d['name']] = d.val
		})
		
		return properties;
	}
	
	
	ink.geo = function(array, f){
		
		if (arguments.length == 1)
			var f = false;
		
		return { 
			
			type : "FeatureCollection",
			features : array.filter(function(element){ return !f || element['coords'] != ""; }).map(function(d){
			
			return {
				type : "Feature",
				geometry : {
					type : "Point",
					coordinates : d['coords'].split(",").map(parseFloat).reverse()
					},
				properties : {
					"name" : d['name'],
					"label" : d['label'],
					"value" : d['value']
					}
			}
			
		})
	}
		
	}
 	
	
})()