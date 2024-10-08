package utils

import (
	"fmt"
	"image"
	"image/draw"
	"image/gif"
	"image/png"
	"log"
	"os"
	"os/exec"
)

func SaveFrames(foldername string, frames []*image.RGBA) {

	os.RemoveAll(foldername)
	os.Mkdir(foldername, 0755)

	for i, frame := range frames {
		out, err := os.Create(fmt.Sprintf("./%s/frame%d.png", foldername, i))
		if err != nil {
			log.Fatal(err)
		}

		png.Encode(out, frame)
		out.Close()
	}
}

func SplitFrames(frames []*image.RGBA) ([]*image.RGBA, []*image.RGBA) {
	leftFrames := make([]*image.RGBA, len(frames))
	rightFrames := make([]*image.RGBA, len(frames))

	for i, frame := range frames {
		leftFrame := image.NewRGBA(image.Rect(0, 0, frame.Bounds().Dx()/2, frame.Bounds().Dy()))
		rightFrame := image.NewRGBA(image.Rect(0, 0, frame.Bounds().Dx()/2, frame.Bounds().Dy()))

		draw.Draw(leftFrame, leftFrame.Bounds(), frame, image.Point{0, 0}, draw.Over)
		draw.Draw(rightFrame, rightFrame.Bounds(), frame, image.Point{frame.Bounds().Dx() / 2, 0}, draw.Over)

		leftFrames[i] = leftFrame
		rightFrames[i] = rightFrame
	}

	return leftFrames, rightFrames
}

func GetGIFFrames(path string) ([]*image.RGBA, error) {
	imgFile, err := os.Open(path)
	if err != nil {
		return nil, err
	}

	defer imgFile.Close()

	img, err := gif.DecodeAll(imgFile)
	if err != nil {
		return nil, err
	}

	firstFrame := img.Image[0]
	frameCount := len(img.Image)

	frames := make([]*image.RGBA, frameCount)

	for i, gifImg := range img.Image {
		currentFrame := image.NewRGBA(firstFrame.Rect)
		if i == 0 {
			draw.Draw(currentFrame, currentFrame.Bounds(), gifImg, gifImg.Bounds().Min, draw.Over)
		} else {
			draw.Draw(currentFrame, currentFrame.Bounds(), frames[i-1], frames[i-1].Bounds().Min, draw.Over)
			draw.Draw(currentFrame, currentFrame.Bounds(), gifImg, image.Point{0, 0}, draw.Over)
		}

		frames[i] = currentFrame
	}

	return frames, nil
}

func GetMp4Frames(path string) ([]*image.RGBA, error) {
	videoFile, err := os.Open(path)
	if err != nil {
		return nil, err
	}

	log.Println("Generating frames from video file")

	os.Mkdir("temp", 0755)

	cmd := exec.Command("ffmpeg", "-i", videoFile.Name(), "temp/frame%d.png")
	err = cmd.Run()
	if err != nil {
		return nil, err
	}

	files, err := os.ReadDir("temp")
	if err != nil {
		return nil, err
	}

	frames := make([]*image.RGBA, len(files))

	for i, file := range files {
		img, err := os.Open("temp/" + file.Name())
		if err != nil {
			return nil, err
		}

		imgData, err := png.Decode(img)
		if err != nil {
			return nil, err
		}

		img.Close()

		frames[i] = imgData.(*image.RGBA)
	}

	log.Println("Frames generated")

	os.RemoveAll("temp")

	return frames, nil
}
