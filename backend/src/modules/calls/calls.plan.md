# Calls Module Plan

Audio/video calls use Socket.IO for signaling and WebRTC for media.

## Signaling Events

- `call:start`
- `call:ringing`
- `call:accept`
- `call:reject`
- `call:end`
- `webrtc:offer`
- `webrtc:answer`
- `webrtc:ice-candidate`

## Database

Call history is stored in `CallSession`.

## Production Note

Peer-to-peer WebRTC works locally, but production needs a TURN server for reliable calls across strict networks.
