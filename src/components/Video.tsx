import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

export default function Video() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerId, setPeerId] = useState('');
  const [myPeer, setMyPeer] = useState(null);

  useEffect(() => {
    const peer = new Peer(); // creates new peer with random ID
    setMyPeer(peer);

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        call.answer(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        });
      });
    });
  }, []);

  const callUser = (otherPeerId) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const call = myPeer.call(otherPeerId, stream);
      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };

  return (
    <div>
      <h3>Your ID: {peerId}</h3>
      <input type="text" placeholder="Enter other user ID" id="remoteId" />
      <button onClick={() => callUser(document.getElementById('remoteId').value)}>Call</button>
      <div>
        <video ref={localVideoRef} autoPlay muted width="300" />
        <video ref={remoteVideoRef} autoPlay width="300" />
      </div>
    </div>
  );
}
