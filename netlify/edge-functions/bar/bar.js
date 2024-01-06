import { html, Router } from 'swtl';

export default async (request) => {
  const router = new Router({
    routes: [
      {
        path: '/',
        render: ({params, query, request}) => html`
          <html><h1>hello world</h1></html>
        `
      },
      {
        path: '/foo',
        render: ({params, query, request}) => html`
          <html><h1>foo</h1></html>
        `
      },
      {
        path: '/',
        render: ({params, query, request}) => html`
          <html><h1>hello world</h1></html>
        `
      },
    ],
    fallback: () => html`<html><h1>not found</h1></html>`
  });

  return router.handleRequest(request);
}