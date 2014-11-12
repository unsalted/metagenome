<?php

require_once('vendor/autoload.php');

// some variables that will be pretttty useful
$consumerKey = '2vfOYl2Id7buV71JSVFrZ8RkQkyNjZ9MPN5WA9FNSxDD6Yhdll';
$consumerSecret = 'nB0CaTOdx37uRYQu5ngCLOkzklbmY1W2GbA4MM18Sy9njBSZ4G';
$client = new Tumblr\API\Client($consumerKey, $consumerSecret);
$requestHandler = $client->getRequestHandler();
$requestHandler->setBaseUrl('https://www.tumblr.com/');


// start the old gal up
$resp = $requestHandler->request('POST', 'oauth/request_token', array());

// get the oauth_token
$out = $result = $resp->body;
$data = array();
parse_str($out, $data);

// tell the user where to go
echo 'https://www.tumblr.com/oauth/authorize?oauth_token=' . $data['oauth_token'];
$client->setToken($data['oauth_token'], $data['oauth_token_secret']);

// get the verifier (will be in URL that the user comes back to)
echo "\noauth_verifier: ";
$handle = fopen('php://stdin', 'r');
$line = fgets($handle);

// exchange the verifier for the keys
$verifier = trim($line);
$resp = $requestHandler->request('POST', 'oauth/access_token', array('oauth_verifier' => $verifier));
$out = $result = $resp->body;
$data = array();
parse_str($out, $data);

// and print out our new keys
$token = $data['oauth_token'];
$secret = $data['oauth_token_secret'];
echo "\ntoken: " . $token . "\nsecret: " . $secret;

// and prove we're in the money
$client = new Tumblr\API\Client($consumerKey, $consumerSecret, $token, $secret);
$info = $client->getUserInfo();
echo "\ncongrats " . $info->user->name . "!\n";