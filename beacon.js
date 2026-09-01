// SITE TRAFFIC BEACON (D-400) — MetraSlate counting its own site, first-party.
//
// It sends the page's path, the host of wherever the reader came from, and the three campaign tags
// if the link they followed carried any. No cookie is set, no id is minted, nothing is stored in
// the browser, and there is no third-party script on this site. The day, the browser family and the
// operating-system family are worked out on OUR server from the request itself; the full
// User-Agent is never stored, and neither is the address the request came from.
//
// ⚠ THE ENDPOINT IS LIVE-SHAPED BUT NOT LIVE-RESOLVING YET. beacon.metraslate.com is the dedicated
// origin the Standard backend will answer on through a tunnel; until that DNS record exists every
// send fails at name resolution. That failure must cost the reader NOTHING — see `send`.
const ENDPOINT = 'https://beacon.metraslate.com/site-beacon'

// A reader who has asked to be left alone is left alone. `prefers-reduced-data` is a request not to
// spend their bytes; Global Privacy Control is a legal opt-out of exactly this kind of collection.
// Either one is a no, and a no is honoured before anything is sent — not filtered out afterwards.
//
// Wrapped, because this runs on every page of the site and a browser that throws on an unknown
// media feature must not be able to break the page over a beacon nobody asked for.
function optedOut() {
  try {
    if (navigator.globalPrivacyControl === true) return true
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-data: reduce)').matches
  } catch (_) {
    // Unknowable is treated as "do not send": the reader's silence is not consent.
    return true
  }
}

// THE THREE CAMPAIGN TAGS, AND NOTHING ELSE FROM THE QUERY STRING. Read here rather than sent as a
// raw query for the server to sift: a link somebody pastes can carry `?email=`, and the strongest
// version of "we do not collect that" is that it never crosses the wire in the first place. Empty
// values are dropped so an absent tag and a blank one are one fact.
function campaign() {
  var tags = {}
  try {
    var params = new URLSearchParams(location.search)
    var names = { utm_source: 'utmSource', utm_medium: 'utmMedium', utm_campaign: 'utmCampaign' }
    for (var key in names) {
      var value = (params.get(key) || '').trim()
      if (value !== '') tags[names[key]] = value.slice(0, 120)
    }
  } catch (_) {
    // A URL this browser cannot parse simply has no campaign on it.
  }
  return tags
}

// ⭐ EVERY FAILURE PATH IS SILENT AND COSTS THE READER NOTHING — the whole point while the endpoint
// does not resolve. `sendBeacon` is fire-and-forget by construction: it hands the request to the
// browser, returns a boolean, and a DNS failure or a refused connection is reported to nobody. The
// throw it CAN do is synchronous (a bad URL, a blocked scheme, an over-quota payload), so the call
// is wrapped and the return value ignored. There is no retry, no fallback `fetch`, no console
// noise: a page that logged an error on every navigation because our tunnel is down would be the
// beacon making itself the reader's problem.
//
// text/plain keeps it a CORS-simple request: no preflight, and the browser discards the answer
// unread. The site never learns anything back — it is a report, not a conversation.
function send(path) {
  try {
    if (optedOut() || typeof navigator.sendBeacon !== 'function') return
    var body = JSON.stringify(Object.assign({ path: path, referrer: document.referrer }, campaign()))
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }))
  } catch (_) {
    // Deliberately empty. Nothing this function can fail at is worth a reader's attention.
  }
}

// THE SITE IS CLIENT-ROUTED, so a beacon on load alone would report the page somebody ENTERED on
// and never the four they read after it — every page but the entry point would look unvisited.
// Wrapping the two history methods is what makes a route change observable; `popstate` catches the
// back button, which does not call either. The whole wrap is guarded for `send`'s reason: this is
// the site's own history object, and a beacon may not be the reason navigation breaks.
function watchRoutes() {
  try {
    var last = location.pathname
    var report = function () {
      if (location.pathname === last) return
      last = location.pathname
      send(last)
    }
    var names = ['pushState', 'replaceState']
    for (var i = 0; i < names.length; i++) {
      ;(function (name) {
        var original = history[name]
        history[name] = function () {
          var result = original.apply(this, arguments)
          report()
          return result
        }
      })(names[i])
    }
    window.addEventListener('popstate', report)
  } catch (_) {
    // The first page still reported; route changes simply go uncounted.
  }
}

send(location.pathname)
watchRoutes()
