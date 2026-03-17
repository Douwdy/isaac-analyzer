export const STEAM_APP_ID = '250900';
export const STEAM_API_KEY = import.meta.env.VITE_STEAM_API_KEY ?? '';

export function fetchJsonp(url) {
  const cb = 'jsonp_' + Math.round(1e6 * Math.random());
  return new Promise((resolve, reject) => {
    window[cb] = data => { delete window[cb]; document.body.removeChild(s); resolve(data); };
    const s = document.createElement('script');
    s.onerror = () => { delete window[cb]; document.body.removeChild(s); reject(new Error('network')); };
    s.src = url + (url.includes('?') ? '&' : '?') + 'jsonp=' + cb;
    document.body.appendChild(s);
  });
}

export async function resolveVanityUrl(vanity, t) {
  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/`
            + `?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(vanity)}`;
  let data;
  try { data = await fetchJsonp(url); } catch { throw new Error(t.steamErrorNetwork); }
  if (data?.response?.success !== 1) throw new Error(t.steamErrorInvalid);
  return data.response.steamid;
}

export async function loadFromSteam(input, t) {
  if (!STEAM_API_KEY) throw new Error(t.steamErrorNoKey);
  if (!input || input.length < 2) throw new Error(t.steamErrorInvalid);

  // Resolve vanity URL if not a 17-digit SteamID64
  let steamId = input;
  if (!/^\d{17}$/.test(input)) {
    steamId = await resolveVanityUrl(input, t);
  }

  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/`
            + `?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${STEAM_APP_ID}`;
  let data;
  try { data = await fetchJsonp(url); } catch { throw new Error(t.steamErrorNetwork); }
  if (!data?.playerstats?.achievements) throw new Error(t.steamErrorPrivate);
  const unlockedIds = new Set();
  for (const a of data.playerstats.achievements) {
    const m = a.name.match(/(\d+)$/);
    if (m && a.achieved) unlockedIds.add(parseInt(m[1]));
  }
  return { unlockedIds, steamId, displayId: input };
}
