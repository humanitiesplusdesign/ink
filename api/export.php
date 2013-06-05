<?php

 //   header("Content-type: application/vnd.ms-excel; name='excel'");
   	header("Content-type: text/csv");
 	header("Content-Disposition: filename=export.csv");
    header("Pragma: no-cache");
    header("Expires: 0");

	$text = '[{"a":"Godefroy Charles Henri de La Tour d\'Auvergne, duc de Bouillon b. 1728 d. 1792 [MROFL][0001]","d":"Ferney, Ain, France [0001]","s":"Navarre, Spain [0001]","r":"François Marie Arouet [Voltaire] b. 1694 d. 1778 [MROFL][0001]","t":1762,"id":"Godefroy Charles Henri de La Tour d\'Auvergne, duc de Bouillon to Voltaire [EE][0001]"}]';
	
	$data = json_decode(($text),true);
	
	//echo $data[0];
	
	$buffer = fopen('php://temp', 'r+');
	//fputcsv($fp, array_keys($data[0]),"\t");
	
    //print json_encode(stripslashes($_REQUEST['exportdata']));
	
	foreach ($data as $d) {
		fputcsv($buffer, array_values($d),"\t",'"');
	}
	
	rewind($buffer);
	$csv = fgets($buffer);
	fclose($buffer);

	echo $csv;
	
	
	/*
	$outstream = fopen("php://output", 'r+');
	
	foreach($data as $csv_data) {
		fputcsv($outstream, array_values($csv_data),"\t");
	}
	
//	rewind($outstream);
	$export_data = stream_get_contents($outstream);
	fclose($outstream);
	//$response->output($export_data);
	
	#fclose($fp);
	*/
?>