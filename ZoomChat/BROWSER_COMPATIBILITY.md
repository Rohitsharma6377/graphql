# Browser Compatibility & System Audio Guide

## Browser Support Matrix

### Desktop Browsers

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Video Calls | ✅ Excellent | ✅ Good | ✅ Good |
| Screen Share | ✅ Excellent | ✅ Good | ⚠️ Limited |
| **Tab Audio** | ✅ **YES** | ⚠️ Limited | ⚠️ macOS only |
| **System Audio** | ✅ **YES** | ❌ No | ❌ No |
| Camera PIP | ✅ YES | ✅ YES | ✅ YES |
| Chat | ✅ YES | ✅ YES | ✅ YES |

### Recommended Setup

**🏆 Best Experience**: Chrome or Edge (Chromium-based)
- Full system audio capture
- Tab audio capture
- Most reliable WebRTC

**🦊 Firefox**: Good for basic calls
- Video/audio calls work great
- Screen sharing works
- Limited system audio

**🍎 Safari**: macOS/iOS only
- Basic video calls work
- Tab audio on macOS
- No system audio capture

## System Audio Capture Guide

### 🎵 What is System Audio?

System audio is the sound playing on your computer (music, videos, games, etc.) that you want to share during screen sharing.

### Chrome/Edge - Tab Audio (RECOMMENDED)

1. Click "Screen Share" button
2. In dialog, select **"Chrome Tab"**
3. **Check the box "Share audio"** ✅
4. Select the tab playing audio
5. Click "Share"

**Perfect for**:
- Sharing YouTube videos
- Streaming music
- Browser-based presentations

### Chrome/Edge - Entire Screen Audio

1. Click "Screen Share" button
2. Select **"Entire Screen"**
3. **Check "Share audio"** (if available)
4. Click "Share"

**Note**: May not work on all operating systems.

### Firefox - Limited Support

Firefox has limited system audio capture:
- Tab audio: Not widely supported
- System audio: Not available

**Workaround**:
1. Open media in Chrome
2. Share Chrome tab with audio
3. Or use virtual audio cables (advanced)

### Safari - macOS Tab Audio Only

1. Click "Screen Share"
2. Select a browser tab
3. Audio from that tab may be shared

**Limitations**:
- Only works for Safari tabs
- No system-wide audio

## Alternative Solutions

### Virtual Audio Cables (Advanced)

For users who need system audio in browsers without native support:

**Windows**:
1. Install VB-AUDIO Virtual Cable
2. Set as default audio output
3. Audio will be captured as "microphone" input

**macOS**:
1. Install BlackHole or Loopback
2. Route system audio through virtual device

**Linux**:
1. Use PulseAudio virtual sinks
2. Configure ALSA loopback

### Screen Recording Notice

If system audio doesn't work:
- Inform the other participant to unmute their speakers
- You can describe what's playing
- Use external speakers near your mic (low quality)

## Testing System Audio

### Quick Test

1. Open YouTube in a Chrome tab
2. Start a call with yourself (two browser windows)
3. Toggle "System Audio ON"
4. Click "Share Screen" → Select the YouTube tab → Check "Share audio"
5. Play a video
6. In the other window, you should hear the video audio!

### Troubleshooting

**"Share audio" checkbox is missing**:
- Update your browser to the latest version
- Try Chrome/Edge instead
- Check OS permissions

**Audio is choppy**:
- Close other applications
- Check internet connection
- Reduce video quality

**No audio captured**:
- Make sure the tab is playing audio
- Verify "Share audio" was checked
- Try restarting screen share

## Best Practices

### For Presenters

1. **Before screen sharing**:
   - Test audio in a separate tab
   - Toggle "System Audio ON" in HeartShare
   - Prepare your content

2. **During screen sharing**:
   - Use Chrome Tab share (not entire screen)
   - Check "Share audio" in the dialog
   - Verify the other person can hear

3. **If audio doesn't work**:
   - Try sharing again
   - Use Chrome browser
   - Fall back to describing content

### For Participants

1. **Check your speakers**:
   - Make sure speakers/headphones are on
   - Volume is sufficient
   - No other apps are blocking audio

2. **Provide feedback**:
   - Let presenter know if audio is working
   - Report any lag or quality issues

## Operating System Considerations

### Windows 10/11
- ✅ Chrome: Full system audio support
- ✅ Edge: Full system audio support
- ⚠️ Firefox: Limited
- ❌ Safari: Not available

### macOS
- ✅ Chrome: Tab audio, some system audio
- ✅ Safari: Tab audio only
- ⚠️ Firefox: Limited

### Linux
- ✅ Chrome/Chromium: Tab audio works
- ⚠️ Firefox: Limited
- 💡 Best with PulseAudio configured

## WebRTC Requirements

All browsers must support:
- `getUserMedia()` - ✅ All modern browsers
- `getDisplayMedia()` - ✅ All modern browsers
- Audio capture in getDisplayMedia - ⚠️ Browser-dependent

## Future Improvements

Upcoming browser features:
- More reliable system audio capture
- Better audio quality
- Wider browser support

---

**Summary**: For best system audio experience, use **Chrome or Edge** and share a **browser tab** with the "Share audio" option checked.
