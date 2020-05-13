import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import axios, { Method } from 'axios'

const httpTrigger: AzureFunction = async function (
	context: Context,
	req: HttpRequest
): Promise<void> {
	const { query, headers, method, body: data } = req
	const { s } = query
	const queries = Object.keys(query)
	const _url = `${s}?${queries
		.filter((k) => k !== 's')
		.reduce((a, c) => `${a}&${c}=${query[c]}`, '')}`
	const { ['pp-additional-query']: additionalQuery = '' } = headers
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
	const { status, data: body, headers: resHeaders } = res

	// eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
	context.res = {
		status,
		body,
		headers: resHeaders,
	}
}

export default httpTrigger
