/* eslint-disable functional/immutable-data */
import test from 'ava'
import fn from './index'
import { Context, HttpRequest } from '@azure/functions'
import axios from 'axios'

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
	const context = {} as Context
	await fn(
		context,
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
	t.is(context.res?.status, res.status)
	t.is(context.res?.body, res.data)
	t.deepEqual(ignore(context.res?.headers), ignore(res.headers))
})

test('Adds the value of "pp-additional-query" header as a passthrough URL', async (t) => {
	const context = {} as Context
	await fn(
		context,
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
	t.is(context.res?.status, res.status)
	t.is(context.res?.body, res.data)
	t.deepEqual(ignore(context.res?.headers), ignore(res.headers))
})
