/* eslint-disable functional/immutable-data */
import test from 'ava'
import fn from './index'
import { Context, HttpRequest } from '@azure/functions'
import axios from 'axios'
import { usableHeaders, response } from './ignore-headers'

const createReq = (opts: {
	readonly url?: string
	readonly headers?: HttpRequest['headers']
	readonly body?: HttpRequest['body']
	readonly method?: HttpRequest['method']
	readonly query?: HttpRequest['query']
}): HttpRequest => (opts as unknown) as HttpRequest
const ignore = (headers: any): any => {
	delete headers.age
	delete headers.date
	delete headers.etag
	delete headers.expires
	delete headers.server
	delete headers['accept-ranges']
	return headers
}

test('Use the string that joined `s` query and other all queries as a passthrough URL', async (t) => {
	const result = await fn(
		{} as Context,
		createReq({
			query: {
				s: 'https://example.com/?a=1',
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
		url: 'https://example.com/?a=1&b=2&c=3',
		headers: {},
		data: '',
	})
	t.is(result.status, res.status)
	t.is(result.body, res.data)
	t.deepEqual(
		ignore(result.headers),
		usableHeaders(ignore(res.headers), response)
	)
})

test('Adds the value of "pp-additional-query" header as a passthrough URL', async (t) => {
	const result = await fn(
		{} as Context,
		createReq({
			query: {
				s: 'https://example.com/?test=yes',
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
		url: 'https://example.com/?test=yes&addition=yes',
		headers: {},
		data: '',
	})
	t.is(result.status, res.status)
	t.is(result.body, res.data)
	t.deepEqual(
		ignore(result.headers),
		usableHeaders(ignore(res.headers), response)
	)
})
