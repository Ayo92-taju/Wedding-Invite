/*
 * Google-font TTF loader for server-side image rendering (Satori/next-og
 * needs raw font data). Fetched once per server instance and cached.
 */
const cache = new Map()

// This legacy Safari UA makes fonts.googleapis.com serve truetype (verified;
// a legacy Firefox UA gets woff instead, which Satori can't parse).
const LEGACY_UA =
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'

export async function googleFont(family, weight = 400, italic = false) {
  const key = `${family}:${weight}:${italic ? 'i' : 'n'}`
  if (cache.has(key)) return cache.get(key)

  const fam = family.replace(/ /g, '+')
  const spec = italic ? `ital,wght@1,${weight}` : `wght@${weight}`
  const cssRes = await fetch(`https://fonts.googleapis.com/css2?family=${fam}:${spec}`, {
    headers: { 'User-Agent': LEGACY_UA },
  })
  const css = await cssRes.text()
  const match = css.match(/src:\s*url\((.+?)\)\s*format\('(?:truetype|opentype)'\)/)
  if (!match) throw new Error(`Could not resolve a TTF for ${key}`)

  const data = await (await fetch(match[1])).arrayBuffer()
  cache.set(key, data)
  return data
}
