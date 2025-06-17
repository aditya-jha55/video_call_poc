import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

export default function Video() {
 const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteIdRef = useRef<HTMLInputElement | null>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [myPeer, setMyPeer] = useState<Peer | null>(null);

  useEffect(() => {
    const peer = new Peer(); // Create a new peer with random ID
    setMyPeer(peer);

    peer.on('open', (id: string) => {
      setPeerId(id);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        call.answer(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      });
    });
  }, []);

  const callUser = () => {
    const otherPeerId = remoteIdRef.current?.value;
    if (!otherPeerId) {
      alert('Please enter a valid remote ID.');
      return;
    }

    if (!myPeer) {
      console.error('Peer not initialized');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const call = myPeer.call(otherPeerId, stream);
      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
    });
  };

  return (
    <div>
      <h3>Your ID: {peerId}</h3>
      <input type="text" placeholder="Enter other user ID" ref={remoteIdRef} />
      <button onClick={callUser}>Call</button>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h4>Local Video</h4>
          <video ref={localVideoRef} autoPlay muted width="300" height="200" />
        </div>
        <div>
          <h4>Remote Video</h4>
          <video ref={remoteVideoRef} autoPlay width="300" height="200" />
        </div>
      </div>
    </div>
  );
}
