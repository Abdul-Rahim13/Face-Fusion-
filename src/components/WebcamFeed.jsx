import { useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'

function WebcamFeed() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        startVideo()
        loadModels()
    }, [])

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

    const detectFaces = () => {
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions()

            const canvas = canvasRef.current
            const displaySize = {
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            }

            faceapi.matchDimensions(canvas, displaySize)
            const resized = faceapi.resizeResults(detections, displaySize)

            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)

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
            className="rounded shadow-lg absolute w-[98vw] h-auto max-h-[90vh] object-cover"
        />

        <canvas
            ref={canvasRef}
            className="rounded absolute w-[98vw] h-auto max-h-[90vh] object-cover scale-x-[-1]"
        />
        </div>
    )
}

export default WebcamFeed
