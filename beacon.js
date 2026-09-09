// Cameron supplied this Cloudflare Web Analytics site identifier for the public website.
// Production-only loading keeps previews and automated local reviews out of its traffic.
;(function () {
  try {
    if (['metraslate.com', 'www.metraslate.com'].indexOf(location.hostname) === -1) return
    if (navigator.globalPrivacyControl === true) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-data: reduce)').matches) return
    if (document.querySelector('script[data-cf-beacon]')) return
    var script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: 'e6b1794bbaf44067b571f95a62cbc115' }))
    document.head.appendChild(script)
  } catch (_) {
    // Analytics failure must never prevent navigation or reading the site.
  }
})()
