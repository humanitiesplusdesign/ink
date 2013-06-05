#!/usr/bin/env python
# encoding: utf-8
"""
time.py

Created by Giorgio Caviglia on 2011-12-21.
"""

import sys
sys.stderr = sys.stdout

import os
import json

def make_filter(start,end):
	return lambda item: item['t'] and int(item['t']) >= start and int(item['t']) <= end

def main():
	
	start = int(sys.argv[1])
	end = int(sys.argv[2])

	f = open("../data/light.json","rb")
	letters = json.load(f)
	
	f2 = open("../data/people.json","rb")
	people = json.load(f2)
	
	f3 = open("../data/places.json","rb")
	places = json.load(f3)
	
	filtered = filter(make_filter(start,end),letters)
	
	years = {}
	values = {}
	values['c'] = []
	values['p'] = []
	values['g'] = []
	values['n'] = []
	values['m'] = []
			
	for y in range(start,end+1):
		years[y] = {}
		years[y]['c'] = {}
		years[y]['g'] = {}
		years[y]['n'] = {}
		years[y]['m'] = {}
		years[y]['p'] = {}
	
	for f in filtered:
		
		year = f['t']
		
		# places
		p = "Not plottable"
		
		if f['d'] != None and f['s'] != None:
			if f['s'] in places and f['d'] in places and 'Coords' in places[f['s']] and 'Coords' in places[f['d']]:
				p = "Plottable"
		
		# people
		correspondents = []
		
		if type(f['a']).__name__ == 'list':
			correspondents.extend(f['a'])
		else:
			correspondents.append(f['a'])
		
		if type(f['r']).__name__ == 'list':
			correspondents.extend(f['r'])
		else:
			correspondents.append(f['r'])
		
		#print correspondents
		for c in correspondents:
			
			if c in people:
				g = people[c]['Gender']
				n = people[c]['Nationality']
				ms = []
				if people[c]['Milieu1'] != "" and people[c]['Milieu1'] != None:
					ms.append(people[c]['Milieu1'])
				if people[c]['Milieu2'] != "" and people[c]['Milieu2'] != None:
					ms.append(people[c]['Milieu2'])
				if people[c]['Milieu3'] != "" and people[c]['Milieu3'] != None:
					ms.append(people[c]['Milieu3'])
				
				
				for m in ms:
					if g in years[year]['g']:
						years[year]['g'][g] += 1
					else:
						years[year]['g'][g] = 1
					
					if n in years[year]['n']:
						years[year]['n'][n] += 1
					else:
						years[year]['n'][n] = 1
					
					if m in years[year]['m']:
						years[year]['m'][m] += 1
					else:
						years[year]['m'][m] = 1
					
					if p in years[year]['p']:
						years[year]['p'][p] += 1
					else:
						years[year]['p'][p] = 1
					
					if 'total' in years[year]['c']:
						years[year]['c']['total'] += 1
					else:
						years[year]['c']['total'] = 1
					
					if not g in values['g']:
						values['g'].append(g)
					if not n in values['n']:
						values['n'].append(n)
					if not m in values['m']:
						values['m'].append(m)
					if not p in values['p']:
						values['p'].append(p)
					if not 'total' in values['c']:
						values['c'].append('total')
	result = {}
	result['years'] = years
	result['values'] = values			
	print json.dumps(result)
			
if __name__ == '__main__':
	main()

