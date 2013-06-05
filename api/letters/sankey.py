#!/usr/bin/env python
# encoding: utf-8
"""
sankey.py

Created by Giorgio Caviglia on 2011-12-27.
Copyright (c) 2011 __MyCompanyName__. All rights reserved.
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
	f.close()
	
	f2 = open("../data/people.json","rb")
	people = json.load(f2)
	f2.close()
	
	filtered = filter(make_filter(start,end),letters)

	sankey = []
	
	for f in filtered:
		
		correspondents = []
		if type(f['a']).__name__ == 'list':
			correspondents.extend(f['a'])
		else:
			correspondents.append(f['a'])
		
		if type(f['r']).__name__ == 'list':
			correspondents.extend(f['r'])
		else:
			correspondents.append(f['r'])
				
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
					o = {}
					o['_id'] = c
					o['g'] = g
					o['n'] = n
					o['m'] = m
					sankey.append(o)

	print json.dumps(sankey);

if __name__ == '__main__':
	main()

