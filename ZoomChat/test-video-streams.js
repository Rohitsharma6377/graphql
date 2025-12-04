// Quick Video Stream Tester
// Open this in browser console (F12) to test your camera and screen share

console.clear()
console.log('🎥 HeartShare Video Stream Tester')
console.log('==================================\n')

async function testCamera() {
  console.log('📹 Testing Camera...')
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: true 
    })
    
    const videoTracks = stream.getVideoTracks()
    const audioTracks = stream.getAudioTracks()
    
    console.log('✅ Camera Access: SUCCESS')
    console.log(`  📹 Video Tracks: ${videoTracks.length}`)
    videoTracks.forEach(track => {
      console.log(`    - ${track.label}`)
      console.log(`      Enabled: ${track.enabled}`)
      console.log(`      State: ${track.readyState}`)
      console.log(`      Settings:`, track.getSettings())
    })
    
    console.log(`  🎤 Audio Tracks: ${audioTracks.length}`)
    audioTracks.forEach(track => {
      console.log(`    - ${track.label}`)
      console.log(`      Enabled: ${track.enabled}`)
      console.log(`      State: ${track.readyState}`)
    })
    
    // Preview video
    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    video.autoplay = true
    video.style.cssText = 'position:fixed;top:10px;right:10px;width:300px;border:3px solid lime;border-radius:10px;z-index:9999;box-shadow:0 0 20px rgba(0,255,0,0.5)'
    document.body.appendChild(video)
    
    console.log('✅ Preview video added to top-right corner')
    console.log('   Run closePreview() to close it\n')
    
    window.testStream = stream
    window.closePreview = () => {
      stream.getTracks().forEach(track => track.stop())
      video.remove()
      console.log('✅ Preview closed and stream stopped')
    }
    
    return true
  } catch (error) {
    console.error('❌ Camera Access: FAILED')
    console.error('   Error:', error.message)
    console.error('   Name:', error.name)
    
    if (error.name === 'NotAllowedError') {
      console.error('   → User denied camera permission')
    } else if (error.name === 'NotFoundError') {
      console.error('   → No camera found on this device')
    } else if (error.name === 'NotReadableError') {
      console.error('   → Camera is in use by another app')
    }
    
    return false
  }
}

async function testScreenShare() {
  console.log('🖥️ Testing Screen Share...')
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ 
      video: true,
      audio: true 
    })
    
    const videoTracks = stream.getVideoTracks()
    const audioTracks = stream.getAudioTracks()
    
    console.log('✅ Screen Share: SUCCESS')
    console.log(`  📹 Video Tracks: ${videoTracks.length}`)
    videoTracks.forEach(track => {
      console.log(`    - ${track.label}`)
      console.log(`      Enabled: ${track.enabled}`)
      console.log(`      State: ${track.readyState}`)
      console.log(`      Settings:`, track.getSettings())
    })
    
    console.log(`  🔊 Audio Tracks: ${audioTracks.length}`)
    audioTracks.forEach(track => {
      console.log(`    - ${track.label}`)
      console.log(`      Enabled: ${track.enabled}`)
    })
    
    // Preview screen
    const video = document.createElement('video')
    video.srcObject = stream
    video.autoplay = true
    video.style.cssText = 'position:fixed;bottom:10px;right:10px;width:400px;border:3px solid orange;border-radius:10px;z-index:9999;box-shadow:0 0 20px rgba(255,165,0,0.5)'
    document.body.appendChild(video)
    
    console.log('✅ Screen preview added to bottom-right corner')
    console.log('   Run closeScreenPreview() to close it\n')
    
    window.screenStream = stream
    window.closeScreenPreview = () => {
      stream.getTracks().forEach(track => track.stop())
      video.remove()
      console.log('✅ Screen preview closed')
    }
    
    return true
  } catch (error) {
    console.error('❌ Screen Share: FAILED')
    console.error('   Error:', error.message)
    return false
  }
}

async function testDeviceList() {
  console.log('📋 Listing All Media Devices...')
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    
    const cameras = devices.filter(d => d.kind === 'videoinput')
    const mics = devices.filter(d => d.kind === 'audioinput')
    const speakers = devices.filter(d => d.kind === 'audiooutput')
    
    console.log(`📹 Cameras: ${cameras.length}`)
    cameras.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.label || 'Unknown Camera'}`)
      console.log(`     ID: ${d.deviceId}`)
    })
    
    console.log(`\n🎤 Microphones: ${mics.length}`)
    mics.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.label || 'Unknown Microphone'}`)
      console.log(`     ID: ${d.deviceId}`)
    })
    
    console.log(`\n🔊 Speakers: ${speakers.length}`)
    speakers.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.label || 'Unknown Speaker'}`)
      console.log(`     ID: ${d.deviceId}`)
    })
    
    console.log('')
    return { cameras, mics, speakers }
  } catch (error) {
    console.error('❌ Device List: FAILED', error)
    return null
  }
}

async function testWebRTC() {
  console.log('🔌 Testing WebRTC Connection...')
  try {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })
    
    console.log('✅ RTCPeerConnection created')
    
    let candidateCount = 0
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        candidateCount++
        console.log(`  🧊 ICE Candidate #${candidateCount}:`, event.candidate.candidate)
      } else {
        console.log(`  ✅ ICE gathering complete. Total candidates: ${candidateCount}`)
        if (candidateCount === 0) {
          console.error('  ❌ No ICE candidates found - Network/Firewall blocking WebRTC!')
        }
      }
    }
    
    pc.onconnectionstatechange = () => {
      console.log(`  🔌 Connection state: ${pc.connectionState}`)
    }
    
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    console.log('  📝 Created offer and set local description')
    console.log('  ⏳ Gathering ICE candidates...')
    
    setTimeout(() => {
      if (candidateCount === 0) {
        console.error('  ❌ Timeout: No ICE candidates after 5 seconds')
        console.error('  → Your network/firewall is blocking WebRTC')
        console.error('  → Try disabling firewall temporarily')
      }
      pc.close()
    }, 5000)
    
    return true
  } catch (error) {
    console.error('❌ WebRTC: FAILED', error)
    return false
  }
}

async function runAllTests() {
  console.log('\n🚀 Running All Tests...\n')
  
  await testDeviceList()
  await testCamera()
  await testScreenShare()
  await testWebRTC()
  
  console.log('\n✅ All tests complete!')
  console.log('\n💡 Available commands:')
  console.log('  closePreview()       - Close camera preview')
  console.log('  closeScreenPreview() - Close screen preview')
  console.log('  testCamera()         - Test camera only')
  console.log('  testScreenShare()    - Test screen share only')
  console.log('  testDeviceList()     - List all devices')
  console.log('  testWebRTC()         - Test WebRTC connection')
}

// Make functions global
window.testCamera = testCamera
window.testScreenShare = testScreenShare
window.testDeviceList = testDeviceList
window.testWebRTC = testWebRTC
window.runAllTests = runAllTests

console.log('✅ Tester loaded!')
console.log('\n📝 Available commands:')
console.log('  runAllTests()        - Run all tests')
console.log('  testCamera()         - Test camera only')
console.log('  testScreenShare()    - Test screen share only')
console.log('  testDeviceList()     - List all devices')
console.log('  testWebRTC()         - Test WebRTC connection')
console.log('\n💡 Start with: runAllTests()\n')
