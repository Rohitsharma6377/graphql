// Camera and microphone permission utilities

export async function requestPermissionsEarly() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    
    // Stop tracks immediately - we just needed permission
    stream.getTracks().forEach(track => track.stop());
    
    return {
      success: true,
      permissions: {
        camera: true,
        microphone: true,
      },
    };
  } catch (error) {
    console.error('Permission request failed:', error);
    
    return {
      success: false,
      error: error.message,
      permissions: {
        camera: false,
        microphone: false,
      },
    };
  }
}

export async function checkPermissions() {
  try {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser');
    }

    // Try to enumerate devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const hasCamera = devices.some(device => device.kind === 'videoinput');
    const hasMicrophone = devices.some(device => device.kind === 'audioinput');
    
    return {
      hasCamera,
      hasMicrophone,
      devices,
    };
  } catch (error) {
    console.error('Failed to check permissions:', error);
    
    return {
      hasCamera: false,
      hasMicrophone: false,
      error: error.message,
    };
  }
}

export function getPermissionInstructions() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome')) {
    return 'Click the camera icon in the address bar and allow camera & microphone access.';
  } else if (userAgent.includes('firefox')) {
    return 'Click the permissions icon in the address bar and allow camera & microphone.';
  } else if (userAgent.includes('safari')) {
    return 'Go to Safari > Settings > Websites > Camera/Microphone and allow access.';
  } else if (userAgent.includes('edge')) {
    return 'Click the lock icon in the address bar and allow camera & microphone access.';
  }
  
  return 'Please allow camera and microphone access in your browser settings.';
}

export async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function requestBothPermissions() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach(track => track.stop());
    return { success: true, camera: true, microphone: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
