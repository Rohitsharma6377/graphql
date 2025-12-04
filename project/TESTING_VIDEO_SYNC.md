# Testing Guide - Video Sync & Screen Share

## Prerequisites
1. Backend server running on port 4000
2. Frontend server running on port 3000
3. Two different browsers (or one normal + one incognito window)

## Test 1: New Member Joining

### Steps:
1. **Browser 1 - Create Meeting:**
   - Navigate to `http://localhost:3000/meetings`
   - Click "Create New Room" or "Start" on an existing room
   - You should enter the video room
   - Check the participant count shows "1 participant"

2. **Browser 1 - Copy Invite Link:**
   - Go back to meetings page
   - Click "Copy Link" button next to the room
   - Should see "Copied!" message

3. **Browser 2 - Join Meeting:**
   - Paste the invite link (e.g., `http://localhost:3000/meeting/abc123`)
   - Should navigate to the same meeting room
   - Grant camera/microphone permissions when prompted

### Expected Results:
✅ Browser 1 shows participant count increase to "2 participants"
✅ Browser 1 shows new participant video card appear
✅ Browser 2 shows both participants (self + the first user)
✅ Both browsers display participant names correctly
✅ Each browser shows "You" for their own video

### Troubleshooting:
❌ If new participant doesn't appear:
- Check browser console for GraphQL errors
- Verify WebSocket connection is active
- Check backend logs for USER_JOINED subscription publish

## Test 2: Screen Sharing

### Steps:
1. **Browser 1 - Start Screen Share:**
   - Click the screen share button (Monitor icon)
   - Browser shows screen picker dialog
   - Select a screen/window to share
   - Click "Share"

2. **Verify Local Display:**
   - Browser 1 should show large screen share area (2x2 grid)
   - Your actual screen content should be visible
   - Label shows "Your Screen"

3. **Verify Remote Display:**
   - Browser 2 should also show screen share area (2x2 grid)
   - Shows placeholder with "User Name is sharing"
   - Label shows "User Name's Screen"

4. **Stop Screen Share:**
   - Browser 1 clicks screen share button again (or "Stop Sharing" in browser)
   - Both browsers should return to normal grid layout
   - Screen share area disappears for everyone

### Expected Results:
✅ Screen share button changes appearance when active
✅ Large screen share area appears for all participants
✅ Local user sees actual screen content
✅ Remote users see indicator that someone is sharing
✅ Stopping screen share updates all clients immediately
✅ Grid layout adjusts when screen share starts/stops

### Troubleshooting:
❌ If screen share doesn't appear:
- Check browser console for `getDisplayMedia` errors
- Verify VIDEO_STATE_CHANGED subscription is working
- Check if `isScreenSharing` state is updating in GraphQL

## Test 3: Mute/Video Toggle

### Steps:
1. **Browser 1 - Toggle Mute:**
   - Click microphone button
   - Should turn red/destructive color
   - Icon changes to MicOff

2. **Verify in Browser 2:**
   - Browser 2 should show muted icon next to participant name
   - Icon appears in participant's video card

3. **Browser 2 - Toggle Video:**
   - Click video button
   - Video turns off, button turns red
   - Icon changes to VideoOff

4. **Verify in Browser 1:**
   - Browser 1 shows avatar placeholder instead of video
   - Participant card shows avatar with gradient background

### Expected Results:
✅ Mute icon appears immediately in all browsers
✅ Video off shows avatar placeholder in all browsers
✅ Controls update in real-time (< 1 second delay)
✅ Icons are color-coded (red for muted/off)

## Test 4: Multiple Participants

### Steps:
1. **Open 4 browsers/tabs:**
   - Browser 1, 2, 3, 4 all join same meeting
   - Use invite link for consistency

2. **Verify Grid Layout:**
   - Should see 2x2 grid with all 4 participants
   - Each participant sees themselves + 3 others

3. **Random Actions:**
   - Browser 1: Mute
   - Browser 2: Turn off video
   - Browser 3: Start screen share
   - Browser 4: Just watch

### Expected Results:
✅ All 4 participants visible in grid
✅ Grid layout is 2x2 (4 equal boxes)
✅ Mute/video states sync across all browsers
✅ Screen share takes priority (2x2 area)
✅ Other participants shrink to smaller grid

## Test 5: Leave Meeting

### Steps:
1. **Browser 2 - Leave:**
   - Click red phone icon (Leave button)
   - Should exit to meetings page or home

2. **Verify in Browser 1:**
   - Participant count decreases to "3 participants"
   - Browser 2's video card disappears
   - Grid layout adjusts (3 participants)

### Expected Results:
✅ USER_LEFT subscription fires
✅ Participant removed from all clients
✅ Grid layout updates automatically
✅ No error messages in console

## Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** 
- Ensure you're logged in
- Check JWT token in localStorage
- Refresh the page

### Issue: WebSocket connection failed
**Solution:**
- Verify backend GraphQL subscriptions are enabled
- Check CORS settings
- Ensure `subscriptions-transport-ws` is configured

### Issue: Camera/mic not working
**Solution:**
- Grant browser permissions
- Check if another app is using camera/mic
- Try different browser
- Check browser console for `getUserMedia` errors

### Issue: Participants not syncing
**Solution:**
- Check GraphQL playground: test subscription manually
  ```graphql
  subscription {
    userJoined(roomId: "your-room-id") {
      userId
      user {
        name
      }
    }
  }
  ```
- Verify PubSub is working in backend
- Check if subscription events are being published

### Issue: Screen share not visible
**Solution:**
- Check if browser supports `getDisplayMedia`
- Verify `isScreenSharing` field in GraphQL response
- Check VIDEO_STATE_CHANGED subscription
- Ensure proper permissions granted

## GraphQL Playground Tests

### Test USER_JOINED subscription:
```graphql
subscription TestUserJoined {
  userJoined(roomId: "clm123abc") {
    userId
    user {
      id
      name
      avatar
    }
  }
}
```

### Test VIDEO_STATE_CHANGED subscription:
```graphql
subscription TestVideoState {
  videoStateChanged(roomId: "clm123abc") {
    userId
    roomId
    isMuted
    isVideoOff
    isScreenSharing
    isSpeaking
  }
}
```

### Test query with participants:
```graphql
query TestRoom {
  room(id: "clm123abc") {
    id
    name
    participants {
      userId
      user {
        name
      }
      videoState {
        isMuted
        isVideoOff
        isScreenSharing
      }
    }
  }
}
```

## Success Criteria

All tests pass when:
- ✅ New participants appear instantly (< 1 second)
- ✅ Screen sharing displays for all users
- ✅ Mute/video states sync in real-time
- ✅ Leaving removes participant from all clients
- ✅ No console errors or warnings
- ✅ UI is responsive and smooth
- ✅ Grid layouts adjust properly
- ✅ Names and avatars display correctly

## Performance Benchmarks

Expected performance:
- Subscription latency: < 100ms
- UI update latency: < 200ms
- Screen share start: < 1 second
- Participant join/leave: < 500ms
- Video state sync: < 300ms

If any metric exceeds these values, check:
- Network latency
- Backend server load
- Database query performance
- PubSub implementation
