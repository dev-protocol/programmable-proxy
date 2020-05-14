import { AzureFunction, HttpRequest } from '@azure/functions'
import axios, { Method } from 'axios'
import { usableHeaders, request, response } from './ignore-headers'
import { parse } from 'url'

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
	const headers = usableHeaders(_reqHeaders, request)
	const url = ((queries, _url) => {
		const queryQ = queries
			.filter((k) => k !== 's')
			.reduce((a, c) => `${a}${a === '' ? '' : '&'}${c}=${query[c]}`, '')
		const { ['pp-additional-query']: queryH = '' } = _reqHeaders
		const joinedQuery = `${queryQ}${queryQ && queryH ? '&' : ''}${queryH}`
		const hasQuery = Boolean(parse(_url).query)
		return `${_url}${hasQuery ? '&' : '?'}${joinedQuery}`
	})(Object.keys(query), query.s)

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
