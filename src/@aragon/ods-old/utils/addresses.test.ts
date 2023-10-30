import {isEnsDomain} from './addresses';

describe('addresses utils', () => {
  describe('isEnsDomain', () => {
    it('returns true for valid ens domains', () => {
      expect(isEnsDomain('test.eth')).toBeTruthy();
      expect(isEnsDomain('dao.aragon.eth')).toBeTruthy();
      expect(isEnsDomain('a.b.eth')).toBeTruthy();
      expect(isEnsDomain('sub-dao.anotherdao.aragon.eth')).toBeTruthy();
      expect(isEnsDomain('123456789.eth')).toBeTruthy();
      expect(isEnsDomain('test_test.eth')).toBeTruthy();
      expect(isEnsDomain('dao_test.ara_gon.eth')).toBeTruthy();
      expect(isEnsDomain('test123456.eth')).toBeTruthy();
      expect(isEnsDomain('123456test.eth')).toBeTruthy();
    });

    it('returns false for invalid ens domain', () => {
      expect(isEnsDomain('test.et')).toBeFalsy();
      expect(isEnsDomain('testeth')).toBeFalsy();
      expect(isEnsDomain('_test.eth')).toBeFalsy();
      expect(isEnsDomain('._test.eth')).toBeFalsy();
      expect(isEnsDomain('-test.eth')).toBeFalsy();
      expect(isEnsDomain('dao.-test.eth')).toBeFalsy();
      expect(isEnsDomain('dao._test.eth')).toBeFalsy();
      expect(isEnsDomain('???.eth')).toBeFalsy();
    });
  });
});
