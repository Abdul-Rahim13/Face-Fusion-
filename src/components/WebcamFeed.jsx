import { useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'

function WebcamFeed() {
    const videoRef = useRef(null)      
    const canvasRef = useRef(null)     

    useEffect(() => {
        startVideo()                 
        loadModels()               
    }, [])

    // Start webcam stream
    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({
            video: true,              
            audio: false
        }).then((stream) => {
            videoRef.current.srcObject = stream  
        }).catch((error) => {
            console.log("Error accessing webcam:", error)
        })
    }

    // Load required models from /models folder
    const loadModels = () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),       
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),      
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),     
            faceapi.nets.faceExpressionNet.loadFromUri('/models')       
        ]).then(() => {
            detectFaces()          
        })
    }

    // Main face detection logic
    const detectFaces = () => {
        setInterval(async () => {
            // Detect faces with landmarks and expressions
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions()

            // Clear canvas and draw over video
            const canvas = canvasRef.current
            const displaySize = {
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            }

            // Match canvas size to video
            faceapi.matchDimensions(canvas, displaySize)

            // Resize detection results to match display
            const resized = faceapi.resizeResults(detections, displaySize)

            // Clear previous drawings
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)

// Mirror drawing on canvas
            ctx.save()
            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)

            faceapi.draw.drawDetections(canvas, resized)
            faceapi.draw.drawFaceLandmarks(canvas, resized)
            faceapi.draw.drawFaceExpressions(canvas, resized)

            ctx.restore()
        }, 1000) 
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative">
            <video
                ref={videoRef}
                autoPlay
                muted
                className="rounded shadow-lg absolute"
                style={{
                    width: '640px',
                    height: '480px',
                }}
            />

            <canvas
                ref={canvasRef}
                className="rounded absolute"
                style={{
                    transform: 'scaleX(-1)',
                    width: '640px',
                    height: '480px',
                }}
            />
        </div>
    )
}

export default WebcamFeed
