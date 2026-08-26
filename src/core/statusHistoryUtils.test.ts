import { type DisplayValue, FieldType, type LinkModel } from '@grafana/data';

import { getDataLinks } from './statusHistoryUtils';

const makeField = (
  values: unknown[],
  links: Array<{ title: string; url: string }>,
  displayFn?: (v: unknown) => DisplayValue
) => ({
  name: 'test',
  type: FieldType.string,
  values,
  config: { links },
  display: displayFn ?? ((v: unknown) => ({ text: String(v), numeric: NaN })),
  getLinks: (_args: { calculatedValue: DisplayValue; valueRowIndex: number }) =>
    links.map((l) => ({
      title: l.title,
      href: l.url,
      origin: {} as never,
      target: '_self',
    })) as Array<LinkModel<typeof field>>,
});

const field = makeField(['a', 'b'], []);

describe('getDataLinks', () => {
  it('returns empty array when field has no configured links', () => {
    const result = getDataLinks(field as never, 0);
    expect(result).toEqual([]);
  });

  it('returns empty array when getLinks is not defined on the field', () => {
    const noGetLinks = {
      name: 'test',
      type: FieldType.string,
      values: ['a'],
      config: { links: [{ title: 'Link', url: 'http://example.com' }] },
      display: (v: unknown) => ({ text: String(v), numeric: NaN }),
    };
    const result = getDataLinks(noGetLinks as never, 0);
    expect(result).toEqual([]);
  });

  it('returns links from getLinks for the given row index', () => {
    const testField = makeField(
      ['val1', 'val2'],
      [
        { title: 'Link A', url: 'http://example.com/a' },
        { title: 'Link B', url: 'http://example.com/b' },
      ]
    );

    const result = getDataLinks(testField as never, 0);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Link A');
    expect(result[0].href).toBe('http://example.com/a');
    expect(result[1].title).toBe('Link B');
    expect(result[1].href).toBe('http://example.com/b');
  });

  it('deduplicates links with identical title/href pairs', () => {
    const dupField = {
      name: 'test',
      type: FieldType.string,
      values: ['a'],
      config: { links: [{ title: 'Dup', url: 'http://example.com' }] },
      display: (v: unknown) => ({ text: String(v), numeric: NaN }),
      getLinks: () => [
        { title: 'Dup', href: 'http://example.com', origin: {} as never, target: '_self' },
        { title: 'Dup', href: 'http://example.com', origin: {} as never, target: '_self' },
        { title: 'Other', href: 'http://other.com', origin: {} as never, target: '_self' },
      ],
    };

    const result = getDataLinks(dupField as never, 0);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Dup');
    expect(result[1].title).toBe('Other');
  });

  it('uses display() to compute the display value passed to getLinks', () => {
    const displayFn = jest.fn((v: unknown) => ({ text: `formatted:${v}`, numeric: 42 }));
    const getLinksFn = jest.fn(() => []);
    const testField = {
      name: 'test',
      type: FieldType.number,
      values: [99],
      config: { links: [{ title: 'L', url: 'http://x.com' }] },
      display: displayFn,
      getLinks: getLinksFn,
    };

    getDataLinks(testField as never, 0);

    expect(displayFn).toHaveBeenCalledWith(99);
    expect(getLinksFn).toHaveBeenCalledWith(
      expect.objectContaining({ calculatedValue: { text: 'formatted:99', numeric: 42 } })
    );
  });

  it('falls back to a plain text display when field.display is not defined', () => {
    const getLinksFn = jest.fn(() => []);
    const noDisplayField = {
      name: 'test',
      type: FieldType.string,
      values: ['hello'],
      config: { links: [{ title: 'L', url: 'http://x.com' }] },
      getLinks: getLinksFn,
    };

    getDataLinks(noDisplayField as never, 0);

    expect(getLinksFn).toHaveBeenCalledWith(
      expect.objectContaining({ calculatedValue: { text: 'hello', numeric: NaN } })
    );
  });
});
