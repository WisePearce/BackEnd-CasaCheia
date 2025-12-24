import { createClient } from "redis"

const client = createClient({
  url: "rediss://default:AcaVAAIncDEzOTY1NWEwMjU5ZTk0MWU3YmM0ZTQyZDhjNzk4MjRlNHAxNTA4Mzc@holy-pug-50837.upstash.io:6379"
});

client.on("error", function(err) {
  throw err;
});
await client.connect()
await client.set('foo','bar');

// Disconnect after usage
const value = await client.get('foo');
console.log(value);