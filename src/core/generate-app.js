// AI-generated app scaffolding: the shell template, but with pages, routes,
// content, and images produced by the SpyneJS generator service from one
// site description. Same contract as the clone path — no terminal output,
// progress via callback, structured result.

import fs from 'fs';
import path from 'path';
import {unzipSync} from 'fflate';

/**
 * Endpoint for the generator service (POST /generate). Env override mirrors
 * the template-repo override pattern; read at call time.
 */
export const DEFAULT_GENERATOR_URL =
    'https://9v1stmpcxd.execute-api.us-east-1.amazonaws.com/prod/generate';

export const generatorUrl = () =>
    process.env.SPYNE_CLI_GENERATOR_URL || DEFAULT_GENERATOR_URL;

const errorFor = (status, body) => {
  if (status === 422) {
    return {
      code: 'GENERATION_INVALID',
      message: 'The generator could not produce a valid site from that ' +
          'description. Try rephrasing it.',
    };
  }
  if (status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: 'The anonymous generation quota for this network was reached. ' +
          'Try again later.',
    };
  }
  if (status === 503 || status === 504) {
    return {
      code: 'GENERATION_TIMEOUT',
      message: 'The generator took too long to respond. Try again — complex ' +
          'descriptions occasionally need a second attempt.',
    };
  }
  return {
    code: 'GENERATION_FAILED',
    message: `Generator request failed (${status}): ` +
        `${(body && body.error) || 'unexpected response'}.`,
  };
};

/**
 * Extract a generated package zip into targetDir, stripping the single
 * top-level directory the package wraps its files in. Entries that would
 * escape targetDir are rejected.
 */
export const extractPackage = (zipBuffer, targetDir) => {
  const entries = unzipSync(new Uint8Array(zipBuffer));
  const resolvedTarget = path.resolve(targetDir);

  for (const [entryPath, data] of Object.entries(entries)) {
    if (entryPath.endsWith('/')) continue;
    const stripped = entryPath.split('/').slice(1).join('/');
    if (!stripped) continue;
    const dest = path.resolve(resolvedTarget, stripped);
    if (!dest.startsWith(resolvedTarget + path.sep)) {
      throw new Error(`Unsafe path in package: ${entryPath}`);
    }
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    fs.writeFileSync(dest, data);
  }
};

/**
 * Generate an application from a site description. Called by createApp once
 * appName/targetDir are validated; performs the network stages and extraction,
 * leaving identity, git, and install to the shared pipeline.
 *
 * @returns {Promise<Object>} {ok, ...} — on success includes appId and
 *     claimToken so renderers can surface the CMS claim.
 */
export async function fetchGeneratedApp({sitePrompt, targetDir, onProgress}) {
  onProgress({
    step: 'generate',
    status: 'start',
    message: 'Generating site with AI (this can take up to a minute)...',
  });

  let res;
  let body;
  try {
    res = await fetch(generatorUrl(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({prompt: sitePrompt}),
      signal: AbortSignal.timeout(120000),
    });
    body = await res.json().catch(() => ({}));
  } catch (err) {
    onProgress({step: 'generate', status: 'fail', message: 'Generation failed.'});
    return {
      ok: false,
      error: {
        code: 'GENERATION_UNREACHABLE',
        message: `Could not reach the generator: ${err.message}`,
      },
    };
  }

  if (!res.ok || !body.packageUrl) {
    onProgress({step: 'generate', status: 'fail', message: 'Generation failed.'});
    return {ok: false, error: errorFor(res.status, body)};
  }

  const pageCount = Array.isArray(body.appModel && body.appModel.content)
      ? body.appModel.content.length
      : undefined;
  onProgress({
    step: 'generate',
    status: 'success',
    message: pageCount
        ? `Site generated (${pageCount} pages).`
        : 'Site generated.',
  });

  onProgress({step: 'download', status: 'start', message: 'Downloading package...'});
  let zipBuffer;
  try {
    const zipRes = await fetch(body.packageUrl,
        {signal: AbortSignal.timeout(120000)});
    if (!zipRes.ok) throw new Error(`HTTP ${zipRes.status}`);
    zipBuffer = Buffer.from(await zipRes.arrayBuffer());
  } catch (err) {
    onProgress({step: 'download', status: 'fail', message: 'Download failed.'});
    return {
      ok: false,
      error: {
        code: 'DOWNLOAD_FAILED',
        message: `Could not download the package: ${err.message}`,
      },
    };
  }
  onProgress({step: 'download', status: 'success', message: 'Package downloaded.'});

  try {
    extractPackage(zipBuffer, targetDir);
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'EXTRACT_FAILED',
        message: `Could not extract the package: ${err.message}`,
      },
    };
  }

  return {ok: true, appId: body.appId, claimToken: body.claimToken};
}
