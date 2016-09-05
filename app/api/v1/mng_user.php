<?php 
$app->post('/catlistunserialize/:id', function($id) use ($app) {
	$db = new DbHandler();
    $records = $db->getAllRecord("select selectedcat from customers_auth where uid = '".$id."'");
	$records[0]['selectedcat'] = unserialize ( $records[0]['selectedcat'] );
	$catarr = array();
	foreach($records[0]['selectedcat'] as $k => $v){
		$catarr[$k] = array('cid'=>$v);
	}
	$response["datares"] = $catarr;
    echoResponse(200, $response); 	
});
$app->get('/catlistn', function() use ($app) {
    $db = new DbHandler();
    $records = $db->getAllRecord("select cid, title from tbl_categories where status_del = 0 order by title ASC");
    $response["datares"] = $records;
    echoResponse(200, $response); 
});
$app->post('/mngusers', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $db = new DbHandler();
    $user = $db->getAllRecord("select * from customers_auth WHERE status_del = 0 AND type='T-User' order by uid desc LIMIT $r->limit");
	foreach($user as &$u){
		$unserdata = unserialize($u['selectedcat']);
		$u['selectedcat'] = $unserdata;
	}
    $response["status"] = "success";
    $response["datares"] = $user;
    echoResponse(200, $response); 
});
$app->post('/userlistsorting', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $ordby = 'DESC';
    if($r->setorderby == 1){
       $ordby = 'ASC';
    }
    $db = new DbHandler();
    $user = $db->getAllRecord("select * from customers_auth WHERE status_del = 0 AND type='T-User' order by $r->orderby $ordby LIMIT $r->limit");
    $response["status"] = "success";
    $response["datares"] = $user;
    echoResponse(200, $response); 
});
$app->post('/user', function() use ($app) {
    $r = json_decode($app->request->getBody());
    verifyRequiredParams(array('email', 'name', 'password'),$r->user);
    require_once 'passwordHash.php';
	$r->user->selectedcat = serialize($r->user->selectedcat);
	$r->user->type = 'T-User';
	$r->user->created = date("Y-m-d H:i:s");
	$password = $r->user->password;
	$r->user->password_dcrpt = $password;
	$r->user->password = passwordHash::hash($password);

    $db = new DbHandler();
    $tabble_name = "customers_auth";
    $column_names = array('phone', 'name', 'email', 'password', 'password_dcrpt', 'city', 'address', 'type', 'selectedcat','created');
    $result = $db->insertIntoTable($r->user, $column_names, $tabble_name);
    if ($result != NULL) {
        $response["status"] = "success";
        $response["message"] = "User created successfully";
        $insertedRow = $db->getOneRecord("select * from customers_auth where uid = $result");
        $response["uid"] = $result;
        $response["datares"] = $insertedRow;
        echoResponse(200, $response);
    } else {
        $response["status"] = "error";
        $response["message"] = "Failed to create user. Please try again";
        echoResponse(201, $response);
    }           
});
$app->delete('/userdelete/:id', function($id) { 
    $db = new DbHandler();
	$data = (object) array('status_del' => 1);
	$rows = $db->update("customers_auth", $data, array('uid'=>$id));
    $rows["message"] = "User removed successfully.";
    echoResponse(200, $rows);
});
$app->put('/userupdate/:id', function($id) use ($app){
	require_once 'passwordHash.php';
    $data = json_decode($app->request->getBody());
	$data->selectedcat = serialize($data->selectedcat);
	$password = $data->password;
	$data->password_dcrpt = $password;
	$data->password = passwordHash::hash($password);

    $db = new DbHandler();
    $rows = $db->update("customers_auth", $data, array('uid'=>$id));
    if($rows["status"]=="success")
    $rows["message"] = "Successfully changed.";
    echoResponse(200, $rows);
});
$app->put('/usrlistfilter', function() use ($app){
    $data = json_decode($app->request->getBody());
    $db = new DbHandler();
    $rows = $db->getAllRecord("select * from customers_auth where status_del = 0 AND type='T-User' LIKE '%$data->keyword%'");
	echoResponse(200, $rows);
});
$app->put('/usrlistpagesize', function() use ($app){
    $data = json_decode($app->request->getBody());
    $db = new DbHandler();
    $rows = $db->getAllRecord("select * from customers_auth WHERE status_del = 0 AND type='T-User' LIMIT $data->limit");
    echoResponse(200, $rows);
});
?>