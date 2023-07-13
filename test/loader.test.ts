/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import loader from '../src/loader';

import type { Options } from '../src/types';

declare type PsuedoCallback = (
    err?: null | Error,
    content?: string | Buffer,
    sourceMap?: string | object,
    additionalData?: object
) => void

interface PseudoLogger {
    error(..._: any[]): void;
    warn(..._: any[]): void;
    info(..._: any[]): void;
}

class FakeLogger implements PseudoLogger {
    error() { return }
    warn() { return }
    info() { return }
}

describe('loader', () => {
    describe('.loader()', () => {
        it('should throw Error when no context is provided', () => {
            expect(() => (loader as any).call(undefined, '')).toThrow(/context/);
        });

        it('should throw Error when no callback is provided', () => {
            expect(() => (loader as any).call({}, '')).toThrow(/callback/);
        });

        it('should throw Error when callback is invalid', () => {
            expect(() => (loader as any).call({async: 'z'}, '')).toThrow(/callback/);
        });

        it('should callback an empty string when empty content is provided', () => {
            return new Promise(resolve => {
                const callback: PsuedoCallback = jest.fn(() => resolve(callback));
                const async = () => callback;

                const context = {
                    getLogger: () => new FakeLogger(),  // provide fake logging
                    getOptions: () => {},               // options not required 
                    async
                };

                (loader as any).call(context, '');
            }).then(callback => {
                expect(callback).toBeCalledWith(null, '');
            });
        });

        const instanceList = [null, 42, BigInt(42), false, undefined, Symbol()];
        for (const i in instanceList) {
            const instance = instanceList[i];
            it(`should callback an Error when content is ${typeof instance}`, () => {
                return new Promise(resolve => {
                    const callback: PsuedoCallback = jest.fn(error => resolve({callback, error}));
                    const async = () => callback;
    
                    const context = {
                        getLogger: () => new FakeLogger(),  // provide fake logging
                        getOptions: () => { },               // options not required 
                        async
                    };
    
                    (loader as any).call(context, instance);
                }).then((resolution) => {
                    const {callback, error} = resolution as any;
                    expect(callback).toHaveBeenCalled();
                    expect(error).toBeInstanceOf(Error);
                });
            });
        }

        it('should callback with stripped comments when options.stripComments is true', () => {
            const content = (
                '// a comment\n' +
                'the code\n' +
                '// another comment\n' +
                '/* multi\n' +
                ' * line\n' +
                ' * comment */');

            const expected = ('the code\n');
            const options: Options = {
                stripComments: true
            };
            
            return new Promise(resolve => {
                const callback: PsuedoCallback = jest.fn(
                    (error, output) => resolve({ callback, error, output }));
                const async = () => callback;


                const context = {
                    getLogger: () => new FakeLogger(),  // provide fake logging
                    getOptions: () => options,
                    async
                };


                (loader as any).call(context, content);
            }).then(resolution => {
                const { callback, error, output } = resolution as any;
                expect(callback).toHaveBeenCalled();
                expect(error).toBe(null);
                expect(output).toContain(JSON.stringify(expected));
            });
        });

        it('should callback with stripped whitespace when options.stripWhitespace is true', () => {
            const content = (
                '// a comment\n' +
                '/* a multiline\n' +
                ' comment */\n' +
                '\t\t   the code \t\t \r\n');

            const expected = (
                '// a comment\n' +
                '/* a multiline\n' +
                ' comment */\n' +
                ' the code');

            const options: Options = {
                stripWhitespace: true
            };

            return new Promise(resolve => {
                const callback: PsuedoCallback = jest.fn(
                    (error, output) => resolve({ callback, error, output }));

                const async = () => callback;

                const context = {
                    getLogger: () => new FakeLogger(),  // provide fake logging
                    getOptions: () => options,
                    async
                };

                (loader as any).call(context, content);
            }).then(resolution => {
                const { callback, error, output } = resolution as any;
                expect(callback).toHaveBeenCalled();
                expect(error).toBe(null);
                expect(output).toContain(JSON.stringify(expected));
            });
        });

        it('should callback with stripped whitespace and comments '
            + 'when options.stripWhitespace and options.stripComments is true', () => {
            const content = (
                '// a comment\n' +
                '/* a multiline\n' +
                ' comment */\n' +
                '\t\t   the code \t\t \r\n');

            const expected = ('the code');
            const options: Options = {
                stripWhitespace: true,
                stripComments: true
            };

            return new Promise(resolve => {
                const callback: PsuedoCallback = jest.fn(
                    (error, output) => resolve({ callback, error, output }));

                const async = () => callback;

                const context = {
                    getLogger: () => new FakeLogger(),  // provide fake logging
                    getOptions: () => options,
                    async
                };

                (loader as any).call(context, content);
            }).then(resolution => {
                const { callback, error, output } = resolution as any;
                expect(callback).toHaveBeenCalled();
                expect(error).toBe(null);
                expect(output).toContain(JSON.stringify(expected));
            });
        });

        it('should callback with ES exports when esModule is true', () => {
            const content = ('a');
            const options: Options = {
                esModule: true
            };

            return new Promise(resolve => {
                const callback: PsuedoCallback = jest.fn(
                    (error, output) => resolve({ callback, error, output }));

                const async = () => callback;

                const context = {
                    getLogger: () => new FakeLogger(),  // provide fake logging
                    getOptions: () => options,
                    async
                };

                (loader as any).call(context, content);
            }).then(resolution => {
                const { callback, error, output } = resolution as any;
                expect(callback).toHaveBeenCalled();
                expect(error).toBe(null);
                expect(output).toContain('export default');
            });
        });

        it('should callback with CommonJS exports when esModule is false', () => {
            const content = ('a');
            const options: Options = {
                esModule: false
            };

            return new Promise(resolve => {
                const callback: PsuedoCallback = jest.fn(
                    (error, output) => resolve({ callback, error, output }));

                const async = () => callback;

                const context = {
                    getLogger: () => new FakeLogger(),  // provide fake logging
                    getOptions: () => options,
                    async
                };

                (loader as any).call(context, content);
            }).then(resolution => {
                const { callback, error, output } = resolution as any;
                expect(callback).toHaveBeenCalled();
                expect(error).toBe(null);
                expect(output).toContain('module.exports =');
            });
        });
    });


});