package utils

import (
	"image"

	"github.com/milindmadhukar/controlify/models"
	"golang.org/x/image/draw"
)

func GetPixelCount(ledMap *models.MatrixMap) int {
	count := 0

	for _, idx := range ledMap.Map {
		if idx != -1 {
			count++
		}
	}

	return count
}

func ImageToPixelData(ledMap *models.MatrixMap, img image.Image, pixelCount int, brightness float64) []byte {
	scaledImg := image.NewRGBA(image.Rect(0,
		0, ledMap.Width, ledMap.Height))

	draw.BiLinear.Scale(scaledImg, scaledImg.Bounds(), img, img.Bounds(), draw.Over, nil)

	data := make([]byte, 3*pixelCount)

	for i := 0; i < len(ledMap.Map); i++ {
		mapIdx := ledMap.Map[i]

		if mapIdx == -1 {
			continue
		}

		x := i % ledMap.Width
		y := i / ledMap.Width

		r, g, b, a := scaledImg.At(x, y).RGBA()

		// Modify r, g, b using alpha and brightness
		r = r * a / 0xffff
		g = g * a / 0xffff
		b = b * a / 0xffff

		r = uint32(float64(r) * brightness)
		g = uint32(float64(g) * brightness)
		b = uint32(float64(b) * brightness)

		data[3*mapIdx] = byte(r >> 8)
		data[3*mapIdx+1] = byte(g >> 8)
		data[3*mapIdx+2] = byte(b >> 8)
	}

	return data
}
