<?php
/*

 This php file works as the main API index.
 It works as a bridge between the AJAX calls from the js application and the actual python scripts
 that perform the query on static json files located in data/
 Although it sounds weird it was the best solution to make the application working on a server,
 without using wsgi or other python modules.
 It basically calls the appropriate python script (via passthru) and pass it the sequence of parameters.

*/


if(array_key_exists( "action", $_REQUEST ) ) {
	$action = $_REQUEST['action'];
}
else {
	$error = array();
	$error['status'] = "error";
	$error['message'] = "No action provided";
	echo json_encode($error);
	die();
}

if(array_key_exists( "on", $_REQUEST )) {
	$on = escapeshellarg($_REQUEST['on']);
} else {
	$on = escapeshellarg("letters");
}

if(array_key_exists( "start", $_REQUEST ) && intval($_REQUEST['start']) != 0 ) {
	$start = escapeshellarg($_REQUEST['start']);
} else {
	$start = escapeshellarg("1694");
}

if(array_key_exists( "end", $_REQUEST ) && intval($_REQUEST['end']) != 0 ) {
	$end = escapeshellarg($_REQUEST['end']);
} else {
	$end = escapeshellarg("1778");
}

if(array_key_exists( "s", $_REQUEST ) ) {
	$source = escapeshellarg(stripslashes($_REQUEST['s']));
} else {
	$source = escapeshellarg("");
}

if(array_key_exists( "d", $_REQUEST ) ) {
	$target = escapeshellarg(stripslashes($_REQUEST['d']));
	
} else {
	$target = escapeshellarg("");
}

if(array_key_exists( "g", $_REQUEST ) ) {
	$gender = escapeshellarg($_REQUEST['g']);
} else {
	$gender = escapeshellarg("");
}

if(array_key_exists( "n", $_REQUEST ) ) {
	$nationality = escapeshellarg($_REQUEST['n']);
} else {
	$nationality = escapeshellarg("");
}

if(array_key_exists( "m", $_REQUEST ) ) {
	$milieu = escapeshellarg($_REQUEST['m']);
} else {
	$milieu = escapeshellarg("");
}

if(array_key_exists( "p", $_REQUEST ) ) {
	$plot = escapeshellarg($_REQUEST['p']);
} else {
	$plot = escapeshellarg("");
}

$dir = dirname( __FILE__ );

passthru("python {$dir}/{$on}/{$action}.py {$start} {$end} {$source} {$target} {$gender} {$nationality} {$milieu} {$plot}");

?>