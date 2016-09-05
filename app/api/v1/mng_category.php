<?php 
$app->post('/mngcategories', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $db = new DbHandler();
    $user = $db->getAllRecord("select cid, title from tbl_categories WHERE status_del = 0 order by cid desc LIMIT $r->limit");
    $response["status"] = "success";
    $response["datares"] = $user;
    echoResponse(200, $response); 
});
$app->post('/categorylistsorting', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $ordby = 'DESC';
    if($r->setorderby == 1){
       $ordby = 'ASC';
    }
    $db = new DbHandler();
    $user = $db->getAllRecord("select cid, title from tbl_categories WHERE status_del = 0 order by $r->orderby $ordby LIMIT $r->limit");
    $response["status"] = "success";
    $response["datares"] = $user;
    echoResponse(200, $response); 
});
$app->post('/category', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $db = new DbHandler();
    $tabble_name = "tbl_categories";
    $column_names = array('title');
    $result = $db->insertIntoTable($r->category, $column_names, $tabble_name);
    if ($result != NULL) {
        $response["status"] = "success";
        $response["message"] = "Category created successfully";
        $insertedRow = $db->getOneRecord("select cid, title from tbl_categories where cid = $result");
        $response["cid"] = $result;
        $response["datares"] = $insertedRow;
        echoResponse(200, $response);
    } else {
        $response["status"] = "error";
        $response["message"] = "Failed to create category. Please try again";
        echoResponse(201, $response);
    }           
});
$app->delete('/categorydelete/:id', function($id) { 
    $db = new DbHandler();
	$data = (object) array('status_del' => 1);
	$rows = $db->update("tbl_categories", $data, array('cid'=>$id));
    $rows["message"] = "Category removed successfully.";
    echoResponse(200, $rows);
});
$app->put('/categoryupdate/:id', function($id) use ($app){
    $data = json_decode($app->request->getBody());
    $db = new DbHandler();
    $rows = $db->update("tbl_categories", $data, array('cid'=>$id));
    if($rows["status"]=="success")
    $rows["message"] = "Status successfully changed.";
    echoResponse(200, $rows);
});
$app->put('/catlistfilter', function() use ($app){
    $data = json_decode($app->request->getBody());
    $db = new DbHandler();
    $rows = $db->getAllRecord("select cid, title from tbl_categories where status_del = 0 LIKE '%$data->keyword%'");
	echoResponse(200, $rows);
});
$app->put('/catlistpagesize', function() use ($app){
    $data = json_decode($app->request->getBody());
    $db = new DbHandler();
    $rows = $db->getAllRecord("select cid, title from tbl_categories WHERE status_del = 0 LIMIT $data->limit");
    echoResponse(200, $rows);
});
?>