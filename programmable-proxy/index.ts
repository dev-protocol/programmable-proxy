import { AzureFunction, HttpRequest } from '@azure/functions'
import axios, { Method } from 'axios'
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
	const {
		['pp-additional-query']: additionalQuery = '',
		['pp-authorization-bearer']: authorizationBearer,
	} = _reqHeaders
	const headers = {
		...usableHeaders(_reqHeaders, request),
		...(authorizationBearer
			? { authorization: `bearer ${authorizationBearer}` }
			: undefined),
	}
	const url = ((q) => {
		const { s: _url } = q
		const queryQ = Object.keys(q)
			.filter((k) => k !== 's')
			.reduce((a, c) => `${a}${a === '' ? '' : '&'}${c}=${q[c]}`, '')
		const joinedQuery = `${queryQ}${
			queryQ && additionalQuery ? '&' : ''
		}${additionalQuery}`
		const hasQuery = Boolean(new URL(_url).search)
		return `${_url}${hasQuery ? '&' : '?'}${joinedQuery}`
	})(query)

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
