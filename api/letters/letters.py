#!/usr/bin/env python
# encoding: utf-8
"""
letters.py

Created by Giorgio Caviglia on 2012-01-02.
Copyright (c) 2012 __MyCompanyName__. All rights reserved.
"""

import sys
sys.stderr = sys.stdout

import os
import json
import StringIO
import string
import re
import csv

class UnicodeWriter(object):
    
    def __init__(self, f, dialect=csv.excel_tab, encoding="utf-16", **kwds):
        # Redirect output to a queue
        self.queue = StringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoding = encoding
    
    def writerow(self, row):
		try:
			# Modified from original: now using unicode(s) to deal with e.g. ints
			self.writer.writerow([unicode(s).encode("utf-8") for s in row])
			# Fetch UTF-8 output from the queue ...
			data = self.queue.getvalue()
			data = data.decode("utf-8")
			# ... and reencode it into the target encoding
			data = data.encode(self.encoding)
			# write to the target stream
			self.stream.write(data)
			# empty queue
			self.queue.truncate(0)
		
		except UnicodeDecodeError as e:
			print e
    
    def writerows(self, rows):
        for row in rows:
            self.writerow(row)

class UnicodeDictWriter(UnicodeWriter):
     
    def __init__(self, f, fields, dialect=csv.excel_tab,
            encoding="utf-16", **kwds):
        super(UnicodeDictWriter, self).__init__(f, dialect, encoding, **kwds)
        self.fields = fields
    
    def writerow(self, drow):
        row = [drow.get(field, '') for field in self.fields]
        super(UnicodeDictWriter, self).writerow(row)



def main():
	
	query = {}
	query['start'] = int(sys.argv[1])
	query['end'] = int(sys.argv[2])
	if sys.argv[3] != "":
		query['s'] = sys.argv[3]
	if sys.argv[4] != "":
		query['d'] = sys.argv[4]
	if sys.argv[5] != "":
		query['g'] = sys.argv[5]
	if sys.argv[6] != "":
		query['n'] = sys.argv[6]
	if sys.argv[7] != "":
		query['m'] = sys.argv[7]
	if sys.argv[8] != "":
		query['p'] = sys.argv[8]
		f3 = open("../data/places.json","rb")
		places = json.load(f3)

	f = open("../data/light.json","rb")
	letters = json.load(f)
	
	f2 = open("../data/people.json","rb")
	people = json.load(f2)
	
	filtered = []
		
	for l in letters:
		
		good = True
		
		if 'start' in query and 'end' in query:
			if l['t'] and int(l['t']) >= query['start'] and int(l['t']) <= query['end']:
				pass
			else:
				good = False
		
		if 's' in query:
			if l['s'] != None:
				if l['s'].encode('utf-8') != query['s']:
					good = False
			else:
				good = False
	
		if 'd' in query:
			if l['d'] != None:
				if l['d'].encode('utf-8') != query['d']:
					good = False
			else:
				good = False
		
		
		if 'g' in query:
			if l['a'] in people:
				person = people[l['a']]
				
				if person['Gender'] != None:
					if person['Gender'] != query['g']:
						good = False
				else:
					good = False
			else:	
				if l['r'] in people:
					person = people[l['r']]
					if person['Gender'] != None:
						if person['Gender'] != query['g']:
							good = False
					else:
						good = False
					

		if 'n' in query:
			if l['a'] in people:
				person = people[l['a']]
				if person['Nationality'] != None:
					if person['Nationality'] != query['n']:
						good = False
				else:
					good = False
			else:
				if l['r'] in people:
					person = people[l['r']]
					if person['Nationality'] != None:
						if person['Nationality'] != query['n']:
							good = False
					else:
						good = False
		
		if 'm' in query:
			if l['a'] in people:
				person = people[l['a']]
				ms = []
				if person['Milieu1'] != "" and person['Milieu1'] != None:
					ms.append(person['Milieu1'])
				if person['Milieu2'] != "" and person['Milieu2'] != None:
					ms.append(person['Milieu2'])
				if person['Milieu3'] != "" and person['Milieu3'] != None:
					ms.append(person['Milieu3'])
				if len(ms) > 0:
					if not query['m'] in ms:
						good = False
				else:
					good = False
			else:
				if l['r'] in people:
					person = people[l['r']]
					ms = []
					if person['Milieu1'] != "" and person['Milieu1'] != None:
						ms.append(person['Milieu1'])
					if person['Milieu2'] != "" and person['Milieu2'] != None:
						ms.append(person['Milieu2'])
					if person['Milieu3'] != "" and person['Milieu3'] != None:
						ms.append(person['Milieu3'])
					if len(ms) > 0:
						if not query['m'] in ms:
							good = False
					else:
						good = False
		
		if 'p' in query:
			if l['d'] in places and l['s'] in places and 'Coords' in places[l['s']] and 'Coords' in places[l['d']]:
				pass
			else:
				good = False
				
		if good == True:
			filtered.append(l)
	
	"""
	dictionary = {
		'a':'Author',
		'r':'Recipient',
		's':'Source',
		'd':'Destination',
		'id':'Id',
		't':'Year'
	}
	
	fw = open("../csv/letters.csv","wb")
	writerH = UnicodeWriter(fw)
	writerH.writerow(map(lambda x: dictionary[x],filtered[0].keys()))
	writer = UnicodeDictWriter(fw,filtered[0].keys())
	writer.writerows(filtered)			
	"""
	print json.dumps(filtered)


if __name__ == '__main__':
	main()

