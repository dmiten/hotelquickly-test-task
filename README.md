Room Auction API
================
#### Running instance: [https://power-buffet.glitch.me](https://power-buffet.glitch.me)

#### Source: [https://github.com/dmiten/hotelquickly-test-task](https://github.com/dmiten/hotelquickly-test-task)

_Read please[TASK.md](./TASK.md) for baseline conditions_

|API point|Method|Request headers|Request body / params|Response headers|HTTP Status / Response body|
|:--- |:---|:---|:---|:---|:---|
|`/`|GET| | | |200 / {status, version}|
|`/auth`|POST|Content-Type: application/x-www-form-urlencoded, Authorization: Basic|{grant_type: password, client_id, client_secret, username, password}| |501 if wrong grant type, 401 if wrong client id/secret, 403 if wrong username/password / {error, error-description}, 200 / {access_token, refresh_token, expires_in, token_type}|
|`/auth`|POST|Content-Type: application/x-www-form-urlencoded|{grant_type: refresh_token, client_id, client_secret, refresh_token}| |200 / {access_token, refresh_token, expires_in, token_type}|
|`/rooms`|GET|Authorization: Bearer ${token}|all: true/false (or none), page (limit is fixed to 20)|WWW-Authenticate will contain auth errors details if any|200 / {docs, total, limit, page, pages} or status according error|
|`/rooms/:roomId`|GET|-- same with previous --| |-- same with previous --|200 / {room} or status according error|
|`/rooms/:roomId`|POST|Content-Type: application/x-www-form-urlencoded, Authorization: Bearer ${token}|{minPrice, description}|WWW-Authenticate, Location|201 / {savedRoom} or status according error|
|`/bids`|GET|Authorization: Bearer ${token}|page (limit is fixed to 20)|WWW-Authenticate will contain auth errors details if any|200 / {docs, total, limit, page, pages} or status according error|
|`/bids/:bidId`|GET|-- same with previous --| |WWW-Authenticate will contain auth errors details if any|200 / {bid} or status according error|
|`/bids/:bidId`|POST|Content-Type: application/x-www-form-urlencoded, Authorization: Bearer ${token}|{roomId, price}|WWW-Authenticate, Location|201 / {savedBid} or status according error|

#### Flow:
- Users can _GET_ `/` info about current API status and version;
- Users have to authorize by _POST_ `/auth` with relevant query headers and body (OAuth2 password grant flow is used);
- In case of obsolete token users can renew it by _POST_ `/auth` with relevant query headers and body;
- Registered users with the appropriate authority _POST_ `/rooms/:roomId` new room for auction (it will start immediately and server _emit_ _"New room"_ event to the _"news"_ room);
- Registered users can _GET_ `/rooms` rooms with active auctions or all rooms (query param all=true);
- Registered users can connect to socket server `https://power-buffet.glitch.me/?token=${_valid_token_here_}`;
- Registered users can join to auction for selected room @ socket server by _emit('join', roomId)_;
- Registered users can _POST_ `/bids/:bidId` new bid according with the rules;
- Auction server will check all conditions and in case of positive _emit_ messages to the _"news"_ and _"${roomId}"_ rooms;
- Registered users can _GET_ `/rooms/:roomId` all info for ${roomId} room (including dynamically populated list of all registered bids for this room);
- Registered users can _GET_ `/bids/:bidId` all info for ${bidId} bid (including actual info about associated room);

#### Docs:
There are exported environment and collection for [Postman](https://www.getpostman.com). It's easy to change some queries (params such as roomId etc.) and try all API points with pre-populated data.

#### Scripts:
- `npm run initialPopulation` will drop all tables in DB an populate it with data from [initialPopulation.json](./config/initialPopulation.json);
- `npm run eslint` will start ESlint and check project according to [.eslintrc](./.eslintrc);
- `npm run test` will start Mocha for run tests from [test](./test) directory;
- `npm run start` will start project locally (you have to run `npm install` first);




