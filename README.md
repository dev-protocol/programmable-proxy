# Usage

Azure CDN endpoint `https://programmable-proxy.azureedge.net` is using these functions as the origin.

programmable-proxy proxies a REST API specified by the `s` query. Any sensitive information that you don't want to expose to a client-side should be added by [Azure CDN rules engine](https://docs.microsoft.com/en-us/azure/cdn/cdn-standard-rules-engine-reference).

If REST API expects that sensitive information to be included in the query, you can specify it from the Azure CDN rules engine using the `pp-additional-query` header.

### For example

Configure Azure CDN rules engine:
![Azure CDN rules engine](https://i.imgur.com/iOGUZPs.png)

Request without sensitive information: `https://programmable-proxy.azureedge.net/?s=https://my.private.api.com/?someParam=1`

➜ Proxied URL: `https://my.private.api.com/?someParam=1&token=ABC123`
