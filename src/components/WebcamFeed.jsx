import { useEffect, useRef } from 'react'
import Tiny_Face_Detector from '../models/tiny_face_detector_model-weights_manifest.json'
import Face_Landmark from '../models/face_landmark_68_tiny_model-weights_manifest.json'

function WebcamFeed() {
    const videoRef = useRef(null)

    useEffect(()=>{
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }).then((stream)=>{
            videoRef.current.srcObject = stream
        }).catch((error)=>{
            console.log("Error accessing webcam:", error)
        })

    }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">

        <video ref={videoRef} height="480" width="640" autoPlay style={{ transform: 'scaleX(-1)'}}/>
        
    </div>
  )
}

export default WebcamFeed