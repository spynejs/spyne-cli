const {expect, assert} = require('chai');
const {SpyneApp, SpyneAppProperties} = require('spyne');

describe('should initialize spyne', () => {
  it('should be show that spyne has initialized', () => {
    SpyneApp.init();
    expect(SpyneAppProperties.initialized).to.be.true;
  });

});