/* eslint-disable functional/immutable-data */
import test, { after } from 'ava'
import fn from './index'
import { Context, HttpRequest } from '@azure/functions'
import axios from 'axios'
import { usableHeaders, response } from './ignore-headers'
import { createServer } from 'http'

const createReq = (opts: {
	readonly url?: string
	readonly headers?: HttpRequest['headers']
	readonly body?: HttpRequest['body']
	readonly method?: HttpRequest['method']
	readonly query?: HttpRequest['query']
}): HttpRequest => (opts as unknown) as HttpRequest
const server = createServer(function (req, res) {
	res.writeHead(200, req.headers)
	res.write(JSON.stringify({ url: req.url }))
	res.end()
}).listen(8888)

test('Use the string that joined `s` query and other all queries as a passthrough URL', async (t) => {
	const result = await fn(
		{} as Context,
		createReq({
			query: {
				s: 'http://localhost:8888/?a=1',
				b: '2',
				c: '3',
			},
			body: '',
			headers: {},
			method: 'GET',
		})
	)
	const res = await axios({
		method: 'GET',
		url: 'http://localhost:8888/?a=1&b=2&c=3',
		headers: {},
		data: '',
	})
	t.is(result.status, res.status)
	t.deepEqual(result.body, res.data)
	t.deepEqual(result.headers, usableHeaders(res.headers, response))
})

test('Adds the value of "pp-additional-query" header as a passthrough URL', async (t) => {
	const result = await fn(
		{} as Context,
		createReq({
			query: {
				s: 'http://localhost:8888/?test=yes',
			},
			body: '',
			headers: {
				'pp-additional-query': 'addition=yes',
			},
			method: 'GET',
		})
	)
	const res = await axios({
		method: 'GET',
		url: 'http://localhost:8888/?test=yes&addition=yes',
		headers: {},
		data: '',
	})
	t.is(result.status, res.status)
	t.deepEqual(result.body, res.data)
	t.deepEqual(result.headers, usableHeaders(res.headers, response))
})

after(() => {
	server.close()
})
