/* global importScripts, firebase */
// מקבל התראות Push כשהאפליקציה סגורה ומציג אותן בטלפון
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js')

const config = JSON.parse(new URL(self.location).searchParams.get('config') || 'null')
if (config) {
  firebase.initializeApp(config)
  const messaging = firebase.messaging()
  messaging.onBackgroundMessage((payload) => {
    const d = payload.data || {}
    self.registration.showNotification(d.title || 'צוות אדרת', {
      body: d.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      lang: 'he',
      dir: 'rtl',
      tag: d.id,
      data: { link: d.link || '/' },
    })
  })
}

// לחיצה על ההתראה פותחת את האפליקציה במסך המתאים
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = new URL('./#' + (e.notification.data?.link || '/'), self.location).href
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ('focus' in c) { c.navigate(url); return c.focus() } }
    return clients.openWindow(url)
  }))
})
