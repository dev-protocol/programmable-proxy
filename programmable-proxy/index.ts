/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statement */
import { AzureFunction, HttpRequest } from '@azure/functions'
import axios, { Method } from 'axios'
import { URL } from 'url'
import { usableHeaders, request, response } from './ignore-headers'

type Response = {
	readonly status: number
	readonly body: string | Record<string, unknown>
	readonly headers: {
		readonly [key: string]: string
	}
}

const httpTrigger: AzureFunction = async function (
	_,
	req: HttpRequest
): Promise<Response> {
	const { query, headers: _reqHeaders, method, body: data } = req

	const url = ((q) => {
		const { s: _url } = q
		const queryQ = Object.keys(q)
			.filter((k) => k !== 's')
			.reduce((a, c) => `${a}${a === '' ? '' : '&'}${c}=${q[c]}`, '')
		const joinedQuery = `${queryQ}${
			queryQ && additionalQuery ? '&' : ''
		}${additionalQuery}`
		const hasQuery = Boolean(_url ? new URL(_url).search : undefined)
		return `${_url}${hasQuery ? '&' : '?'}${joinedQuery}`
	})(query)

	const isTwitterApi = new URL(url).hostname === 'api.twitter.com'
	const {
		['pp-additional-query']: additionalQuery = '',
		['pp-authorization-bearer']: tmp,
	} = _reqHeaders
	const authorizationBearer = isTwitterApi ? tmp : ''
	const headers = {
		...usableHeaders(_reqHeaders, request),
		...(authorizationBearer
			? { authorization: `bearer ${authorizationBearer}` }
			: undefined),
	}

	const res = await axios({
		method: method as Method,
		url,
		headers,
		data,
	})
	const { status, data: body, headers: _resHeaders } = res
	const resHeaders = usableHeaders(_resHeaders, response)

	return {
		status,
		body,
		headers: resHeaders,
	}
}

export default httpTrigger
