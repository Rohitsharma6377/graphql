# Video Sync & Screen Share Fixes

## Issues Fixed

### 1. **New Members Not Showing**
**Problem:** When someone joins using the same URL, they don't appear in the participant list.

**Root Cause:** 
- Subscription data structure mismatch between backend and frontend
- Backend was publishing `userJoined: userObj` (just the user object)
- Frontend expected `userJoined: { userId, user: {...} }` (participant structure)

**Fix:**
- Updated `backend/resolvers/mutations/room.js` to publish proper participant data:
  ```javascript
  pubsub.publish(`${EVENTS.USER_JOINED}_${roomId}`, {
    userJoined: {
      userId: user.id,
      user: userObj,
    },
  })
  ```
- Updated `frontend/graphql/queries.js` USER_JOINED subscription to match:
  ```graphql
  subscription UserJoined($roomId: ID!) {
    userJoined(roomId: $roomId) {
      userId
      user {
        id
        name
        avatar
        status
      }
    }
  }
  ```

### 2. **Screen Sharing Not Showing**
**Problem:** When someone shares their screen, other participants can't see it.

**Root Causes:**
- Only showing local screen share (your own)
- No display for remote participants' screen shares
- Video state not being synced properly

**Fixes:**
- Updated video grid to check if ANY participant is screen sharing:
  ```javascript
  {participants.some(p => p.isScreenSharing) && (
    // Show screen share area
  )}
  ```
- If local user is sharing, show the video stream
- If remote user is sharing, show placeholder with their name
- Screen share now takes 2x2 grid area when active

### 3. **Participant Video States Not Syncing**
**Problem:** Participant mute/video/screen share states not visible to others.

**Root Cause:**
- GET_ROOM query didn't include participant video states
- Room data polling didn't fetch videoState field

**Fix:**
- Updated GET_ROOM query to include videoState:
  ```graphql
  participants {
    userId
    user {
      id
      name
      avatar
      status
    }
    videoState {
      isMuted
      isVideoOff
      isScreenSharing
      isSpeaking
    }
  }
  ```
- Updated room data effect to use video states:
  ```javascript
  .map(p => ({
    id: p.userId,
    name: p.user?.name || 'Guest',
    isMuted: p.videoState?.isMuted || false,
    isVideoOff: p.videoState?.isVideoOff || false,
    isScreenSharing: p.videoState?.isScreenSharing || false,
    isSpeaking: p.videoState?.isSpeaking || false,
  }))
  ```

### 4. **User Left Not Working**
**Problem:** When someone leaves, they still appear in the participant list.

**Fix:**
- Updated USER_LEFT subscription data structure to match USER_JOINED
- Backend now publishes:
  ```javascript
  pubsub.publish(`${EVENTS.USER_LEFT}_${roomId}`, {
    userLeft: {
      userId: user.id,
      user: userObj,
    },
  })
  ```

### 5. **GET_ROOMS Query Updated**
**Enhancement:** Updated to use new participant structure and include invite links.

**Changes:**
- Added `inviteLink` field
- Updated participants to use `userId` and nested `user` structure
- Now compatible with the copy invite link feature

## Files Modified

### Backend
1. `backend/resolvers/mutations/room.js`
   - Fixed USER_JOINED event data
   - Fixed USER_LEFT event data

### Frontend
1. `frontend/graphql/queries.js`
   - Fixed USER_JOINED subscription
   - Fixed USER_LEFT subscription
   - Updated GET_ROOM to include videoState
   - Updated GET_ROOMS to include inviteLink and new participant structure

2. `frontend/components/video/RealVideoRoom.js`
   - Fixed participant data extraction from room query
   - Added remote screen share display
   - Fixed video grid to show any participant's screen share

## How It Works Now

### Joining a Meeting
1. User opens invite link (e.g., `http://localhost:3000/meeting/abc123`)
2. Frontend calls `joinRoom` mutation
3. Backend creates Participant record
4. Backend publishes USER_JOINED event with `{ userId, user }`
5. All connected clients receive subscription update
6. New participant appears in everyone's video grid

### Screen Sharing
1. User clicks screen share button
2. Browser shows screen picker dialog
3. User selects screen/window to share
4. `updateVideoState` mutation called with `isScreenSharing: true`
5. Backend publishes VIDEO_STATE_CHANGED event
6. All participants see screen share area (2x2 grid)
7. Local user sees their actual screen stream
8. Remote users see placeholder with sharer's name

### Video State Sync
1. User toggles mute/video/screen share
2. GraphQL mutation updates VideoState in database
3. Subscription broadcasts change to all participants
4. Each client updates their local participant state
5. UI reflects current state (muted icon, video off, screen share indicator)

## Testing

### Test New Member Joining
1. Open meeting in Browser 1
2. Copy invite link
3. Open same link in Browser 2 (incognito/different browser)
4. Verify new participant appears in both browsers

### Test Screen Sharing
1. Have 2+ participants in meeting
2. Click screen share in one browser
3. Verify all participants see screen share area
4. Verify sharing participant's name is shown
5. Stop screen share
6. Verify screen share area disappears for everyone

### Test Video State Sync
1. Have 2+ participants
2. Toggle mute in one browser
3. Verify muted icon appears for that participant in all browsers
4. Toggle video off
5. Verify avatar placeholder shows instead of video
6. Repeat for all participants

## Environment Variables Required

Make sure backend has:
```env
FRONTEND_URL=http://localhost:3000
```

This is used for generating invite links in `Room.inviteLink` field resolver.
