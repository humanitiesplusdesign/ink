Ink
===
An [**Athanasius**](http://athanasius.stanford.edu) project 

---

Ink is an interactive visual tool for exploring correspondence data. It provides three different 
views on the data: 

*	a **map** showing the geographical location of each letter
*	a time-based **stacked bar** for comparing the composition of correspondent groups over time
*	an **alluvial diagram** highlighting the relations between three (or more) dimensions of the data related to correspondents


From a technological point of view, Ink is a web applications using PHP and Python for processing and serving the data and JavaScript (d3 and jQuery library) for the visualizations and the UI.

Three main data collections (as JSON files) are used:

**light.json**  
Contains the collection of letters in a lightweight format:
	
	[
		{
			a : "authorId",
			d : "destinationId",
			s : "sourceId",
			r : "recipientId",
			t : "year",
			id : "letterId"
		}, 
		...
	]


**people.json**  
Contains the collection of persons in a single JSON object (keys are persons'id)
	
	{
		"personId":
			{
				"Name": "...",
				"Gender": "…",
				"Milieu1": "…",
				"Milieu2": "…",
				"Milieu3": "…",
				"Nationality": "...",
				"Id": "personId"
			},
			...
	}
	
**places.json**  
Similar to places.json, contains the collection of places in a single JSON object (keys are persons'id)
	
	{
		"placeId":
			{
				"City": "",
				"PlaceName": "",
				"Country": "",
				"Region": "",
				"FullName": "",
				"_id": "",
				"InLocationDB": ""
			},
			...
	}

