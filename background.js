const getImage = () => {
  try {
    const showToast = (message, success = true) => {
      const containerId = 'sc-coverart-toast-container'
      let container = document.getElementById(containerId)
      if (!container) {
        container = document.createElement('div')
        container.id = containerId
        Object.assign(container.style, {
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          zIndex: 2147483647,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        })
        document.body.appendChild(container)
      }

      const toast = document.createElement('div')
      toast.textContent = message
      Object.assign(toast.style, {
        background: success ? 'rgba(46,204,113,0.95)' : 'rgba(231,76,60,0.95)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        fontSize: '13px',
        pointerEvents: 'auto',
        opacity: '0',
        transform: 'translateY(8px)',
        transition: 'opacity 240ms, transform 240ms',
        maxWidth: '260px',
        wordBreak: 'break-word',
      })

      container.appendChild(toast)
      requestAnimationFrame(() => {
        toast.style.opacity = '1'
        toast.style.transform = 'translateY(0)'
      })

      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateY(8px)'
        toast.addEventListener(
          'transitionend',
          () => {
            toast.remove()
          },
          { once: true }
        )
      }, 3000)
    }

    const _getImage = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) throw new Error('Failed to fetch image')
        const blob = await response.blob()

        const img = document.createElement('img')
        img.src = URL.createObjectURL(blob)
        await new Promise((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Image load error'))
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        const pngBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        )
        if (!pngBlob) throw new Error('Canvas toBlob failed')

        const item = new ClipboardItem({ 'image/png': pngBlob })
        await navigator.clipboard.write([item])
        URL.revokeObjectURL(img.src)
        showToast('Artwork copied to clipboard.', true)
      } catch (err) {
        console.error('SoundCloud Coverart Getter error:', err)
        showToast('Failed to copy artwork.', false)
      }
    }

    const elements = document.querySelectorAll('span.sc-artwork.sc-artwork-40x')

    let found = false
    for (const element of elements) {
      try {
        const style = element.style
        const backgroundImage = style.backgroundImage
        if (backgroundImage && backgroundImage.startsWith('url(')) {
          const m = backgroundImage.match(/^url\((?:'|\")?(.*?)(?:'|\")?\)$/)
          if (m && m[1]) {
            const url = m[1]
            found = true
            _getImage(url)
          }
        }
      } catch (e) {
        console.error(e)
        showToast('Failed to copy artwork.', false)
      }
    }

    if (!found) {
      showToast('No artwork found on this page.', false)
    }
  } catch (e) {
    console.error('Unhandled error in getImage:', e)
    try {
      // If possible, show an in-page toast
      const containerId = 'sc-coverart-toast-container'
      let container = document.getElementById(containerId)
      if (!container) {
        container = document.createElement('div')
        container.id = containerId
        Object.assign(container.style, {
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          zIndex: 2147483647,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        })
        document.body.appendChild(container)
      }
      const toast = document.createElement('div')
      toast.textContent = 'Failed to copy artwork.'
      Object.assign(toast.style, {
        background: 'rgba(231,76,60,0.95)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        fontSize: '13px',
        pointerEvents: 'auto',
        opacity: '0',
        transform: 'translateY(8px)',
        transition: 'opacity 240ms, transform 240ms',
        maxWidth: '260px',
        wordBreak: 'break-word',
      })
      container.appendChild(toast)
      requestAnimationFrame(() => {
        toast.style.opacity = '1'
        toast.style.transform = 'translateY(0)'
      })
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateY(8px)'
        toast.addEventListener(
          'transitionend',
          () => {
            toast.remove()
          },
          { once: true }
        )
      }, 3000)
    } catch (innerErr) {
      console.error('Also failed to show toast:', innerErr)
    }
  }
}

// When a browser action is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id
    chrome.scripting
      .executeScript({ target: { tabId }, function: getImage })
      .catch((err) => {
        console.error('executeScript failed:', err)
        // Try to inject a simple toast as a fallback. This may also fail if the
        // extension lacks host permissions; we just log then.
        chrome.scripting
          .executeScript({
            target: { tabId },
            func: (message, success) => {
              const containerId = 'sc-coverart-toast-container'
              let container = document.getElementById(containerId)
              if (!container) {
                container = document.createElement('div')
                container.id = containerId
                Object.assign(container.style, {
                  position: 'fixed',
                  right: '16px',
                  bottom: '16px',
                  zIndex: 2147483647,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-end',
                  pointerEvents: 'none',
                })
                document.body.appendChild(container)
              }
              const toast = document.createElement('div')
              toast.textContent = message
              Object.assign(toast.style, {
                background: success
                  ? 'rgba(46,204,113,0.95)'
                  : 'rgba(231,76,60,0.95)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                fontSize: '13px',
                pointerEvents: 'auto',
                opacity: '0',
                transform: 'translateY(8px)',
                transition: 'opacity 240ms, transform 240ms',
                maxWidth: '260px',
                wordBreak: 'break-word',
              })
              container.appendChild(toast)
              requestAnimationFrame(() => {
                toast.style.opacity = '1'
                toast.style.transform = 'translateY(0)'
              })
              setTimeout(() => {
                toast.style.opacity = '0'
                toast.style.transform = 'translateY(8px)'
                toast.addEventListener(
                  'transitionend',
                  () => {
                    toast.remove()
                  },
                  { once: true }
                )
              }, 3000)
            },
            args: ['Failed to run extension on this page.', false],
          })
          .catch((e) => console.error('Fallback toast injection failed:', e))
      })
  })
})
