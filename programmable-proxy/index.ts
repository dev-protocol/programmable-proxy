import { AzureFunction, HttpRequest } from '@azure/functions'
import axios, { Method } from 'axios'
import { usableHeaders, request, response } from './ignore-headers'

type Response = {
	readonly status: number
	readonly body: string | object
	readonly headers: {
		readonly [key: string]: string
	}
}

const httpTrigger: AzureFunction = async function (
	_,
	req: HttpRequest
): Promise<Response> {
	const { query, headers: _reqHeaders, method, body: data } = req
	const { s } = query
	const queries = Object.keys(query)
	const _url = `${s}?${queries
		.filter((k) => k !== 's')
		.reduce((a, c) => `${a}&${c}=${query[c]}`, '')}`
	const { ['pp-additional-query']: additionalQuery = '' } = _reqHeaders
	const headers = usableHeaders(_reqHeaders, request)
	const hasQuery = queries.length > 1
	const url = `${_url}${
		hasQuery ? `&${additionalQuery}` : `?${additionalQuery}`
	}`
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
