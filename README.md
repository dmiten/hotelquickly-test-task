Room Auction API
================
_Read please TASK.md for baseline conditions_

|API point|Method|Request headers|Request body / params|Response headers|HTTP Status / Response body|
|:--- |:---|:---|:---|:---|:---|
|/|GET| | | |200 / {status, version}|
|/auth|POST|Content-Type: application/x-www-form-urlencoded, Authorization: Basic|{grant_type: password, client_id, client_secret, username, password}| |501 if wrong grant type, 401 if wrong client id/secret, 403 if wrong username/password / {error, error-description}, 200 / {access_token, refresh_token, expires_in, token_type}|
|/auth|POST|-- same with previous --|{grant_type: refresh_token, client_id, client_secret, refresh_token}|
|/rooms|GET|Authorization: Bearer ${token}|all: true/false (or none), page (limit is fixed to 20)|WWW-Authenticate will contain auth errors details if any|200 / {docs, total, limit, page, pages} or status according error|
|/rooms/:roomId|GET|-- same with previous --| |-- same with previous --|200 / {room} or status according error|
|/rooms/:roomId|POST|Content-Type: application/x-www-form-urlencoded, Authorization: Bearer ${token}|{minPrice, description}|WWW-Authenticate, Location|201 / {savedRoom} or status according error|
|/bids|GET|Authorization: Bearer ${token}|page (limit is fixed to 20)|WWW-Authenticate will contain auth errors details if any|200 / {docs, total, limit, page, pages} or status according error|
|/bids/:bidId|GET|-- same with previous --| |WWW-Authenticate will contain auth errors details if any|200 / {bid} or status according error|
|/bids/:bidId|POST|Content-Type: application/x-www-form-urlencoded, Authorization: Bearer ${token}|{roomId, price}|WWW-Authenticate, Location|201 / {savedBid} or status according error|


