import { stripWhitespace, stripComments } from './syntax';

describe('syntax', () => {
  describe('.stripWhitespace', () => {
    it('should remove extra spaces', () => {
      const _in =
        'nwr["amenity"="school"](dataset);   nwr["amenity"="university"](dataset);';
      const out =
        'nwr["amenity"="school"](dataset); nwr["amenity"="university"](dataset);';
      expect(stripWhitespace(_in)).toEqual(out);
    });

    it('should remove extra tabs', () => {
      const _in =
        'nwr["amenity"="school"](dataset);\t\t\t\tnwr["amenity"="university"](dataset);';
      const out =
        'nwr["amenity"="school"](dataset); nwr["amenity"="university"](dataset);';
      expect(stripWhitespace(_in)).toEqual(out);
    });

    it('should remove extra newlines', () => {
      const _in =
        'nwr["amenity"="school"](dataset);\n\n\n\r\n\r\n\nnwr["amenity"="university"](dataset);';
      const out =
        'nwr["amenity"="school"](dataset);\nnwr["amenity"="university"](dataset);';
      expect(stripWhitespace(_in)).toEqual(out);
    });

    it('should remove extra mixed whitespace', () => {
      const _in =
        'nwr["amenity"="school"](dataset);\n\n\n\t\t \r \n\r\t\n\n nwr["amenity"="university"](dataset);';
      const out =
        'nwr["amenity"="school"](dataset);\nnwr["amenity"="university"](dataset);';
      expect(stripWhitespace(_in)).toEqual(out);
    });

    it('should not remove line comments', () => {
      const _in = '// a comment line\n' + 'some code!';

      expect(stripWhitespace(_in)).toEqual(_in);
    });

    it('should not remove multiline comments', () => {
      const _in =
        '/* a\n' +
        ' * * multi\n' +
        '    \t* line\n\n' +
        ' comment! \n' +
        ' */\n' +
        'some code!';

      expect(stripWhitespace(_in)).toEqual(_in);
    });
  });

  describe('.stripComments', () => {
    it('should remove line comments', () => {
      const _in =
        '// Show schools\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '// Show universities\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';

      expect(stripComments(_in)).toEqual(out);
    });

    it('should preserve line comments with @preserve', () => {
      const _in =
        '// Show schools @preserve\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '// Show universities\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        '// Show schools @preserve\n' +
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';

      expect(stripComments(_in)).toEqual(out);
    });

    it('should remove multiline comments ([space]* prefixed)', () => {
      const _in =
        '/*\n' +
        ' * Show schools\n' +
        ' */\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '/*\n' +
        ' * Show universities\n' +
        ' */\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';

      expect(stripComments(_in)).toEqual(out);
    });

    it('should remove multiline comments (* prefixed)', () => {
      const _in =
        '/*\n' +
        '* Show schools\n' +
        '*/\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '/*\n' +
        '* Show universities\n' +
        '*/\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';

      expect(stripComments(_in)).toEqual(out);
    });

    it('should remove multiline comments (no prefix)', () => {
      const _in =
        '/*\n' +
        '       >> Show schools\n' +
        '*/\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '/*\n' +
        '      :-) Show universities\n' +
        '*/\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';

      expect(stripComments(_in)).toEqual(out);
    });

    it('should remove mixed multiline comments', () => {
      const _in =
        '/*****\n' +
        '       >> Show schools\n' +
        '****/\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '/* more content\n' +
        '   **   :-) Show universities ~~~ **\n' +
        '*/\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';

      expect(stripComments(_in)).toEqual(out);
    });

    it('should remove single-line multiline comments', () => {
      const _in =
        '/** schools */\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '/*unis*/\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';

      expect(stripComments(_in)).toEqual(out);
    });

    it('should preserve multiline comments with @preserve', () => {
      const _in =
        '/** @preserve \n' +
        'Schools */\n' +
        'nwr["amenity"="school"](dataset);\n' +
        '/*    \n' +
        ' \nuniversities**\n' +
        ' *** ***/\n' +
        'nwr["amenity"="university"](dataset);';

      const out =
        '/** @preserve \n' +
        'Schools */\n' +
        'nwr["amenity"="school"](dataset);\n' +
        'nwr["amenity"="university"](dataset);';
      expect(stripComments(_in)).toEqual(out);
    });
  });
});
