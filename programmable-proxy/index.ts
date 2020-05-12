import { AzureFunction, Context, HttpRequest } from '@azure/functions'

const httpTrigger: AzureFunction = async function (
	context: Context,
	req: HttpRequest
): Promise<void> {
	const name = req.query.name || (req.body && req.body.name)
	const responseMessage = name
		? 'Hello, ' + name + '. This HTTP triggered function executed successfully.'
		: 'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.'

	// eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
	context.res = {
		body: responseMessage,
	}
}

export default httpTrigger
