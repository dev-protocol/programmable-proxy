export const request = ['host', 'pp-additional-query']

export const response = ['transfer-encoding']

export const usableHeaders = (
	headers: { readonly [key: string]: string },
	ignore: readonly string[]
): { readonly [key: string]: string } => {
	const h = Object.keys(headers).filter((k) => !ignore.includes(k))
	return h.reduce(
		(a, c) => ({
			...a,
			...{ [c]: headers[c] },
		}),
		{}
	)
}
