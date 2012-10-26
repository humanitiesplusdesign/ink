"""
prova.py
by Giorgio Caviglia
giorgio.caviglia@gmail.com
"""

import sys
sys.stderr = sys.stdout

import os
import json

def make_filter(start,end):
	return lambda item: int(item['t']) >= start and int(item['t']) <= end

def main():
	start = int(sys.argv[1])
	end = int(sys.argv[2])

	f = open("../data/light.json","rb")
	letters = json.load(f)
	f.close()
	
	f2 = open("../data/places.json","rb")
	places = json.load(f2)
	f2.close()
	
	filtered = filter(make_filter(start,end),letters)

	geo = {}
	
	nodes = {}
	links = {}
	info = {}
	info['nos'] = 0
	info['nod'] = 0
	info['no'] = 0
	info['yes'] = 0

	
	for f in filtered:
		s = f['s']
		d = f['d']
		
		p = False
		
		if f['d'] != None and f['s'] != None:
			if f['s'] in places and f['d'] in places and 'Coords' in places[f['s']] and 'Coords' in places[f['d']]:
				p = True
		
		if p == False:
			info['no'] += 1
		else:
			info['yes'] += 1
		
		if s != None and not s in nodes:
			if 'Coords' in places[s] and places[s]['Coords'] != "":
				nodes[s] = {}
				nodes[s]['name'] = s
				nodes[s]['label'] = places[s]['FullName']
				nodes[s]['index'] = len(nodes.keys())-1
				nodes[s]['coords'] = places[s]['Coords']
				nodes[s]['value'] = 0
			else:
				info['nos'] += 1
		
		if d != None and not d in nodes:
			if 'Coords' in places[d] and places[d]['Coords'] != "":
				nodes[d] = {}
				nodes[d]['name'] = d
				nodes[d]['label'] = places[d]['FullName']
				nodes[d]['index'] = len(nodes.keys())-1
				nodes[d]['coords'] = places[d]['Coords']
				nodes[d]['value'] = 0
			else:
				info['nod'] += 1
		
		if s in nodes and d in nodes:
			if not s in links:
				links[s] = {}
			if not d in links[s]:
				links[s][d] = 1
			else:
				links[s][d] += 1
		
		if s in nodes:		
			nodes[s]['value'] += 1
		if d in nodes:
			nodes[d]['value'] += 1

	finalLinks = []
	finalNodes = []
	
	for l in links:
		so = links[l]
		for d in so:
			do = so[d]
			fl = {};
			fl['source'] = nodes[l]['index']
			fl['target'] = nodes[d]['index']
			fl['value'] = do
			finalLinks.append(fl)
	
	for n in nodes:
		node = nodes[n]
		fn = {}
		fn['name'] = node['name']
		fn['coords'] = node['coords']
		fn['label'] = node['label']
		fn['index'] = node['index']
		fn['value'] = node['value']
		finalNodes.append(fn)
	
	sortedNodes = sorted(finalNodes, key=lambda node: node['index'])
	
	geo['nodes'] = sortedNodes
	geo['links'] = finalLinks
	geo['info'] = info
	
	print json.dumps(geo)
		

if __name__ == '__main__':
	main()

