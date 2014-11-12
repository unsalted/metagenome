<?php // Requesting for http://www.tumblr.com/oauth/request_token
$consumerKey = '2vfOYl2Id7buV71JSVFrZ8RkQkyNjZ9MPN5WA9FNSxDD6Yhdll';
$consumerSecret = 'nB0CaTOdx37uRYQu5ngCLOkzklbmY1W2GbA4MM18Sy9njBSZ4G';
$client = new lib\Tumblr\API\Client($consumerKey, $consumerSecret);
// Change the base url
$client->getRequestHandler()->setBaseUrl('http://www.tumblr.com/');
$req = $client->getRequestHandler()->request('POST', 'oauth/request_token', [
  'oauth_callback' => '...',
]);
// Get the result
$result = $req->body->__toString();
