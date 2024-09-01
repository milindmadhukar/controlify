package main

import (
	"encoding/json"
	"image"
	"log"
	"os"
	"time"

	"github.com/milindmadhukar/controlify/models"
	"github.com/milindmadhukar/controlify/utils"
	ddp "github.com/milindmadhukar/ddp-go"
	"golang.org/x/image/draw"
)

var framesChan = make(chan image.Image)

func main() {

	defer close(framesChan)

	plusClient, err := ddp.DefaultDDPConnection("192.168.1.41", 4048)
	if err != nil {
		log.Fatal(err)
	}

	defer plusClient.Close()

	crossClient, err := ddp.DefaultDDPConnection("192.168.1.42", 4048)
	if err != nil {
		log.Fatal(err)
	}

	defer crossClient.Close()

	var plusMap models.MatrixMap
	plusMapFile, err := os.Open("assets/maps/plusledmap.json")
	if err != nil {
		log.Fatal(err)
	}

	plusMapDecoder := json.NewDecoder(plusMapFile)
	err = plusMapDecoder.Decode(&plusMap)
	if err != nil {
		log.Fatal(err)
	}

	plusMapFile.Close()

	var crossMap models.MatrixMap
	crossMapFile, err := os.Open("assets/maps/crossledmap.json")
	if err != nil {
		log.Fatal(err)
	}

	crossMapDecoder := json.NewDecoder(crossMapFile)
	err = crossMapDecoder.Decode(&crossMap)
	if err != nil {
		log.Fatal(err)
	}

	crossMapFile.Close()

	plusPixelCount := utils.GetPixelCount(&plusMap)
	crossPixelCount := utils.GetPixelCount(&crossMap)

	fps := 1
	brightness := 0.4
	delay := 1e9 / fps
	splitImage := false

	ticker := time.NewTicker(time.Duration(delay) * time.Nanosecond)

	frames, err := utils.GetGIFFrames("assets/gifs/fire.gif")
	// frames, err := GetMp4Frames("./oops.mp4")
	frameCount := len(frames)

	if err != nil {
		log.Fatal(err)
	}

	// Generate frames from the GIF
	go func() {
		idx := 0
		for range ticker.C {
			framesChan <- frames[idx]
			idx = (idx + 1) % frameCount
		}
	}()

	lastRecievedFrame := time.Now()

	for frame := range framesChan {
		go func(frame image.Image) {
			var leftFrame, rightFrame image.Image
			if splitImage {
				leftFrame = image.NewRGBA(image.Rect(0, 0, frame.Bounds().Dx()/2, frame.Bounds().Dy()))
				rightFrame = image.NewRGBA(image.Rect(0, 0, frame.Bounds().Dx()/2, frame.Bounds().Dy()))

				draw.Draw(leftFrame.(*image.RGBA), leftFrame.Bounds(), frame, image.Point{0, 0}, draw.Over)
				draw.Draw(rightFrame.(*image.RGBA), rightFrame.Bounds(), frame, image.Point{frame.Bounds().Dx() / 2, 0}, draw.Over)

			} else {
				leftFrame = frame
				rightFrame = frame
			}

			plusData := utils.ImageToPixelData(&plusMap, leftFrame, plusPixelCount, brightness)
			plusClient.Write(plusData)

			crossData := utils.ImageToPixelData(&crossMap, rightFrame, crossPixelCount, brightness)
			crossClient.Write(crossData)

			timeTaken := time.Since(lastRecievedFrame)
			lastRecievedFrame = time.Now()

			log.Println("Current frame rate: ", 1e6/timeTaken.Microseconds())
		}(frame)
	}

}
