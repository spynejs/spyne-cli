// The generator resolves default output paths against ./src/app/, so the suite
// needs that tree to exist. It used to be committed source that also shipped in
// the published tarball; it is now created and torn down as a test fixture.

import fs from 'fs';
import path from 'path';

const APP_FIXTURE = path.resolve('./src/app');
const FIXTURE_DIRS = ['components', 'channels', 'traits'].
    map((d) => path.join(APP_FIXTURE, d));

export const mochaHooks = {
  beforeAll() {
    FIXTURE_DIRS.forEach((dir) => fs.mkdirSync(dir, {recursive: true}));
  },
  afterAll() {
    fs.rmSync(APP_FIXTURE, {recursive: true, force: true});
  },
};
