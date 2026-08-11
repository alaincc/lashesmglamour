import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = () => {
  const key = process.env.INDEXNOW_KEY || '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d';
  return [
    { params: { key } }
  ];
};

export const GET: APIRoute = ({ params }) => {
  const key = params.key || process.env.INDEXNOW_KEY || '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d';
  return new Response(key, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};
