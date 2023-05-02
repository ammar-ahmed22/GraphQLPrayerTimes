// Helper functions to make simple GraphQL requests

export type QueryAPIOptions = {
  query: string,
  url: string,
  variables?: Record<string, any>,
}



export const queryAPI = async (opts: QueryAPIOptions) => {
  const fetchOptions: RequestInit = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
        query: opts.query,
        variables: opts.variables
    })
  };

  const response = await fetch(opts.url, fetchOptions);
  const data = await response.json();

  return data;
}