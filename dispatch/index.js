/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const ORIGIN = 'beagleboy--stefan-guggisberg.hlx.page';
//const ORIGIN = 'origin.beagleboy.org';

async function fetchResponse(event) {
  const url = new URL(event.request.url);
  const cache = caches.default;
  let response = await cache.match(event.request);

  if (!response) {
    response = await fetch(event.request, { cf: { resolveOverride: ORIGIN, cacheTtl: 300 } });  // cache response for 5m
    const headers = { 'cache-control': 'public, max-age=14400' }; // browser cache ttl: 4h
    response = new Response(response.body, { ...response, headers });
    event.waitUntil(cache.put(event.request, response.clone()))
  }
  return response
}

async function handleRequest(event) {
  const url = new URL(event.request.url);
  if (url.pathname === '/') {
    url.pathname = '/index.html';
    return Response.redirect(url.toString(), 301);
  }

  if (event.request.method === 'GET') {
    let response = await fetchResponse(event);
    if (response.status > 399) {
      response = new Response(response.statusText, { status: response.status });
    }
    return response;
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
});
