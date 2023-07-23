/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  defaultPropertiesFilter,
  hasProperties,
  isTraversible,
  processProperties,
} from './properties';
import type { PropertiesFilter } from './loader';

describe('properties', () => {
  const rejectNonObjects = (f: (p: any) => any) => {
    it('should reject Nulls', () => {
      expect(f(null)).toBeFalsy();
    });

    it('should reject Strings', () => {
      expect(f('a string!')).toBeFalsy();
    });

    it('should reject Numbers', () => {
      expect(f(42)).toBeFalsy();
    });

    it('should reject BigInts', () => {
      expect(f(BigInt(0))).toBeFalsy();
    });

    it('should reject Booleans', () => {
      expect(f(false)).toBeFalsy();
      expect(f(true)).toBeFalsy();
    });

    it('should reject Undefined', () => {
      expect(f(undefined)).toBeFalsy();
    });

    it('should reject Symbols', () => {
      expect(f(Symbol())).toBeFalsy();
      expect(f(Symbol('asdf'))).toBeFalsy();
      expect(f(Symbol(42))).toBeFalsy();
    });
  };

  describe('.isTraversible', () => {
    rejectNonObjects(isTraversible);

    it('should accept Objects', () => {
      expect(isTraversible({})).toStrictEqual(true);
      expect(isTraversible({ a: 'value', b: 42 })).toStrictEqual(true);
      expect(isTraversible(Object())).toStrictEqual(true);
      expect(isTraversible(Object({ a: 'value', b: 42 }))).toStrictEqual(true);
      expect(isTraversible(Object('asdf'))).toStrictEqual(true);
      expect(isTraversible(Object(42))).toStrictEqual(true);
    });
  });

  describe('.hasProperties', () => {
    rejectNonObjects(hasProperties);

    it('should reject empty Objects', () => {
      expect(hasProperties({})).toStrictEqual(false);
      expect(hasProperties(Object())).toStrictEqual(false);
      expect(hasProperties(Object({}))).toStrictEqual(false);
    });

    it('should reject Objects without .properties', () => {
      expect(hasProperties({ not_relevant: 42 })).toStrictEqual(false);
      expect(hasProperties({ not_relevant: 'str' })).toStrictEqual(false);
      expect(hasProperties({ not_relevant: null })).toStrictEqual(false);
    });

    it('should reject Objects with non-Object .properties', () => {
      expect(hasProperties({ properties: 42 })).toStrictEqual(false);
      expect(hasProperties({ properties: 'str' })).toStrictEqual(false);
      expect(hasProperties({ properties: null })).toStrictEqual(false);
    });

    it('should accept Objects with any Object .properties', () => {
      expect(hasProperties({ properties: { a: 42 } })).toStrictEqual(true);
      expect(hasProperties({ properties: { b: 'str' } })).toStrictEqual(true);
      expect(hasProperties({ properties: { c: null } })).toStrictEqual(true);
    });

    it('should accept Objects with any Object .properties and annihilated .prototype', () => {
      // we are testing this to prove we can handle poorly instantiated objects
      const obj = Object({ properties: { a: 'asdf' } });
      delete obj.prototype;

      // validate the test
      expect(obj).not.toHaveProperty('prototype');

      expect(hasProperties(obj)).toStrictEqual(true);
    });
  });

  describe('.defaultPropertiesFilter', () => {
    rejectNonObjects(defaultPropertiesFilter);

    it('should return empty Object when for empty properties', () => {
      expect(defaultPropertiesFilter({})).toMatchObject({});
    });

    it('should keep "name" property', () => {
      const properties = { name: 'Hello world!' };
      expect(defaultPropertiesFilter(properties)).toMatchObject(properties);
    });

    it('should keep "alt_name" property', () => {
      const properties = { alt_name: 'Hello world!' };
      expect(defaultPropertiesFilter(properties)).toMatchObject(properties);
    });

    it('should keep any "addr:*" property', () => {
      const properties = {
        'addr:city': 'Pittsburgh',
        'addr:state': 'Pennsylvania',
        'addr:zip': '15201',
        'addr:house': '123 ABC Street',
        'addr:country': 'United States',
        address: 'Hello world!',
      };
      expect(defaultPropertiesFilter(properties)).toMatchObject(properties);
    });

    it('should remove any other properties', () => {
      expect(
        defaultPropertiesFilter({
          alt_name: 'Happy place',
          'addr:city': 'Pittsburgh',
          'addr:state': 'Pennsylvania',
          'addr:zip': '15201',
          'addr:house': '123 ABC Street',
          'addr:country': 'United States',
          address: 'Hello world!',
          wikipedia: 'some article!',
          idk: 'another',
          spam: 'too many tags!',
        })
      ).toMatchObject({
        alt_name: 'Happy place',
        'addr:city': 'Pittsburgh',
        'addr:state': 'Pennsylvania',
        'addr:zip': '15201',
        'addr:house': '123 ABC Street',
        'addr:country': 'United States',
        address: 'Hello world!',
      });
    });
  });

  describe('.processProperties', () => {
    rejectNonObjects(processProperties);

    it('should leave Objects alone if no filter is applied', () => {
      const json = {
        a: 2,
        b: 3,
        c: 'asdf',
        d: {
          a: 2,
          b: 3,
          c: 'asdf',
          properties: {
            hello: 'world',
          },
        },
      };

      const filter: PropertiesFilter = (obj) => obj;
      expect(processProperties(json, filter)).toEqual(json);
    });

    it('should remove deeply nested properties', () => {
      const json = {
        a: 2,
        b: 3,
        c: 'asdf',
        d: {
          a: 2,
          b: 3,
          c: 'asdf',
          properties: {
            hello: 'world',
          },
        },
      };

      const filter: PropertiesFilter = defaultPropertiesFilter;
      expect(processProperties(json, filter)).toEqual({
        a: 2,
        b: 3,
        c: 'asdf',
        d: {
          a: 2,
          b: 3,
          c: 'asdf',
          properties: {},
        },
      });
    });
  });
});
