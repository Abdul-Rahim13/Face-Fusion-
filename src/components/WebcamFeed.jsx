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
        }).then(stream => {
            videoRef.current.srcObject = stream
        }).catch(err => {
            console.error("Error accessing webcam:", err)
        })
    }

    const loadModels = async () => {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ])
        detectFaces()
    }

    const detectFaces = () => {
        const interval = setInterval(async () => {
            const video = videoRef.current
            const canvas = canvasRef.current

            if (!video || !canvas || video.readyState !== 4) return

            const displaySize = {
                width: video.videoWidth,
                height: video.videoHeight,
            }

            canvas.width = displaySize.width
            canvas.height = displaySize.height

            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions()

            const resized = faceapi.resizeResults(detections, displaySize)

            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Flip canvas horizontally to match mirrored video
            ctx.save()
            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)

            faceapi.draw.drawDetections(canvas, resized)
            faceapi.draw.drawFaceLandmarks(canvas, resized)
            faceapi.draw.drawFaceExpressions(canvas, resized)

            ctx.restore()
        }, 100)
        return () => clearInterval(interval)
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                width="640"
                height="480"
                className="rounded shadow-lg absolute"
                style={{ transform: 'scaleX(-1)' }} // Mirror video only
            />

            <canvas
                ref={canvasRef}
                className="rounded absolute"
                style={{
                    width: '640px',
                    height: '480px',
                }}
            />
        </div>
    )
}

export default WebcamFeed
